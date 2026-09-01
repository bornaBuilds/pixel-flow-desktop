//! Batch image conversion: takes paths in, writes converted files to the app
//! cache, and streams per-file progress back over a channel.
//!
//! No image bytes cross the IPC boundary. The web version returned base64 data
//! URLs, which inflated every payload by ~33% and pinned whole 4K images in the
//! webview's heap. Here the webview only ever sees paths and renders them
//! through the asset protocol.

use std::collections::HashSet;
use std::path::{Path, PathBuf};
use std::sync::atomic::{AtomicUsize, Ordering};
use std::sync::Arc;

use serde::{Deserialize, Serialize};
use serde_json::json;
use tauri::ipc::Channel;
use tauri::{AppHandle, Manager};

use crate::sidecar;

/// How many conversions may be in flight at once. libvips already threads
/// internally, so oversubscribing here costs memory without buying speed.
const MAX_IN_FLIGHT: usize = 4;

#[derive(Debug, Clone, Copy, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum OutputFormat {
    Webp,
    Jpeg,
    Png,
    Avif,
}

impl OutputFormat {
    fn as_str(self) -> &'static str {
        match self {
            Self::Webp => "webp",
            Self::Jpeg => "jpeg",
            Self::Png => "png",
            Self::Avif => "avif",
        }
    }

    /// Extension on disk. Note jpeg -> .jpg, which is why this is not just
    /// `as_str()`.
    fn extension(self) -> &'static str {
        match self {
            Self::Webp => "webp",
            Self::Jpeg => "jpg",
            Self::Png => "png",
            Self::Avif => "avif",
        }
    }
}

#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ConvertOptions {
    pub format: OutputFormat,
    /// 1..=100. None means the encoder default (webp/jpeg 80, avif 50).
    pub quality: Option<u8>,
    /// None means keep the original size. Bounds only ever shrink.
    pub max_width: Option<u32>,
    pub max_height: Option<u32>,
}

#[derive(Clone, Serialize)]
#[serde(
    rename_all = "camelCase",
    rename_all_fields = "camelCase",
    tag = "event",
    content = "data"
)]
pub enum ConvertEvent {
    Started {
        batch_id: String,
        total: usize,
        output_dir: String,
    },
    FileStart {
        index: usize,
        file_name: String,
    },
    FileDone {
        index: usize,
        file_name: String,
        output_path: String,
        bytes_in: u64,
        bytes_out: u64,
        width: u32,
        height: u32,
    },
    FileError {
        index: usize,
        file_name: String,
        message: String,
    },
    Finished {
        batch_id: String,
        succeeded: usize,
        failed: usize,
    },
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct BatchHandle {
    pub batch_id: String,
    pub output_dir: String,
}

#[derive(Debug, thiserror::Error)]
pub enum ConvertError {
    #[error("could not prepare the output folder: {0}")]
    OutputDir(String),
    #[error("{0}")]
    Sidecar(#[from] sidecar::SidecarError),
}

impl serde::Serialize for ConvertError {
    fn serialize<S: serde::Serializer>(&self, s: S) -> Result<S::Ok, S::Error> {
        s.serialize_str(&self.to_string())
    }
}

fn file_name_of(path: &Path) -> String {
    path.file_name()
        .map(|n| n.to_string_lossy().to_string())
        .unwrap_or_else(|| path.display().to_string())
}

/// `photo.png` + webp -> `photo.webp`, with in-batch collisions disambiguated.
///
/// Names are reserved in a set rather than probed with `Path::exists`: the
/// conversions run concurrently, so an existence check would race and two
/// sources both called `photo.*` would resolve to the same output, with the
/// second silently clobbering the first.
fn plan_output_paths(dir: &Path, sources: &[PathBuf], format: OutputFormat) -> Vec<PathBuf> {
    let mut taken: HashSet<String> = HashSet::new();
    sources
        .iter()
        .enumerate()
        .map(|(index, source)| {
            let stem = source
                .file_stem()
                .map(|s| s.to_string_lossy().to_string())
                .filter(|s| !s.is_empty())
                .unwrap_or_else(|| format!("image-{index}"));
            let ext = format.extension();

            let mut name = format!("{stem}.{ext}");
            let mut suffix = 1;
            while taken.contains(&name) || dir.join(&name).exists() {
                name = format!("{stem}-{suffix}.{ext}");
                suffix += 1;
            }
            taken.insert(name.clone());
            dir.join(name)
        })
        .collect()
}

#[tauri::command]
pub async fn convert_images(
    app: AppHandle,
    paths: Vec<PathBuf>,
    options: ConvertOptions,
    on_event: Channel<ConvertEvent>,
) -> Result<BatchHandle, ConvertError> {
    let batch_id = uuid::Uuid::new_v4().to_string();

    let output_dir = app
        .path()
        .app_cache_dir()
        .map_err(|e| ConvertError::OutputDir(e.to_string()))?
        .join("batches")
        .join(&batch_id);
    std::fs::create_dir_all(&output_dir).map_err(|e| ConvertError::OutputDir(e.to_string()))?;

    // The static scope covers $APPCACHE/batches/**, but widen explicitly so the
    // webview can read these files back through convertFileSrc().
    let _ = app
        .asset_protocol_scope()
        .allow_directory(&output_dir, false);

    let _ = on_event.send(ConvertEvent::Started {
        batch_id: batch_id.clone(),
        total: paths.len(),
        output_dir: output_dir.display().to_string(),
    });

    let succeeded = Arc::new(AtomicUsize::new(0));
    let failed = Arc::new(AtomicUsize::new(0));
    let semaphore = Arc::new(tokio::sync::Semaphore::new(MAX_IN_FLIGHT));

    let outputs = plan_output_paths(&output_dir, &paths, options.format);

    let tasks = paths
        .into_iter()
        .zip(outputs)
        .enumerate()
        .map(|(index, (source, output))| {
            let app = app.clone();
            let on_event = on_event.clone();
            let options = options.clone();
            let semaphore = semaphore.clone();
            let succeeded = succeeded.clone();
            let failed = failed.clone();

            async move {
                let _permit = semaphore.acquire().await;
                let file_name = file_name_of(&source);
                let _ = on_event.send(ConvertEvent::FileStart {
                    index,
                    file_name: file_name.clone(),
                });

                let request = json!({
                    "op": "convert",
                    "input": source.to_string_lossy(),
                    "output": output.to_string_lossy(),
                    "format": options.format.as_str(),
                    "quality": options.quality,
                    "maxWidth": options.max_width,
                    "maxHeight": options.max_height,
                });

                match sidecar::request(&app, request).await {
                    Ok(reply) => {
                        succeeded.fetch_add(1, Ordering::Relaxed);
                        let n = |k: &str| reply.get(k).and_then(serde_json::Value::as_u64);
                        let _ = on_event.send(ConvertEvent::FileDone {
                            index,
                            file_name,
                            output_path: output.display().to_string(),
                            bytes_in: n("bytesIn").unwrap_or(0),
                            bytes_out: n("bytesOut").unwrap_or(0),
                            width: n("width").unwrap_or(0) as u32,
                            height: n("height").unwrap_or(0) as u32,
                        });
                    }
                    Err(error) => {
                        // One bad file fails that file only; the batch carries on.
                        failed.fetch_add(1, Ordering::Relaxed);
                        let _ = on_event.send(ConvertEvent::FileError {
                            index,
                            file_name,
                            message: error.to_string(),
                        });
                    }
                }
            }
        });

    futures::future::join_all(tasks).await;

    let _ = on_event.send(ConvertEvent::Finished {
        batch_id: batch_id.clone(),
        succeeded: succeeded.load(Ordering::Relaxed),
        failed: failed.load(Ordering::Relaxed),
    });

    Ok(BatchHandle {
        batch_id,
        output_dir: output_dir.display().to_string(),
    })
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn maps_extension_not_format_name() {
        // jpeg -> .jpg is the case the web version got wrong: it hardcoded
        // ".webp" on every download regardless of the chosen format.
        assert_eq!(OutputFormat::Jpeg.extension(), "jpg");
        assert_eq!(OutputFormat::Jpeg.as_str(), "jpeg");
        assert_eq!(OutputFormat::Webp.extension(), "webp");
    }

    #[test]
    fn derives_output_name_from_source_stem() {
        let dir = std::env::temp_dir().join("pf-test-stem");
        let out = plan_output_paths(&dir, &[PathBuf::from("/a/b/photo.png")], OutputFormat::Webp);
        assert_eq!(out[0].file_name().unwrap(), "photo.webp");
    }

    #[test]
    fn disambiguates_same_basename_without_touching_the_filesystem() {
        // The regression that shipped in the first cut: two sources named
        // photo.* both resolved to photo.webp because the check was
        // `candidate.exists()` and the conversions run concurrently, so
        // neither had written yet.
        let dir = std::env::temp_dir().join("pf-test-collide-not-created");
        let out = plan_output_paths(
            &dir,
            &[
                PathBuf::from("/one/photo.png"),
                PathBuf::from("/two/photo.avif"),
                PathBuf::from("/three/photo.tiff"),
            ],
            OutputFormat::Webp,
        );
        assert_eq!(out[0].file_name().unwrap(), "photo.webp");
        assert_eq!(out[1].file_name().unwrap(), "photo-1.webp");
        assert_eq!(out[2].file_name().unwrap(), "photo-2.webp");
        let unique: std::collections::HashSet<_> = out.iter().collect();
        assert_eq!(unique.len(), 3, "planned paths must be unique");
    }

    #[test]
    fn falls_back_when_the_source_has_no_stem() {
        let dir = std::env::temp_dir().join("pf-test-nostem");
        let out = plan_output_paths(&dir, &[PathBuf::from("/")], OutputFormat::Png);
        assert_eq!(out[0].file_name().unwrap(), "image-0.png");
    }
}
