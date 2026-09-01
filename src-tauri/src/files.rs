//! Copying converted files out of the app cache to wherever the user chose.
//!
//! The webview picks a destination via the dialog plugin and hands us the path;
//! the bytes never travel through IPC.

use std::path::{Path, PathBuf};

use serde::Serialize;

#[derive(Debug, thiserror::Error)]
pub enum FileError {
    #[error("could not copy {name}: {message}")]
    Copy { name: String, message: String },
    #[error("could not create {0}")]
    CreateDir(String),
}

impl Serialize for FileError {
    fn serialize<S: serde::Serializer>(&self, s: S) -> Result<S::Ok, S::Error> {
        s.serialize_str(&self.to_string())
    }
}

fn name_of(path: &Path) -> String {
    path.file_name()
        .map(|n| n.to_string_lossy().to_string())
        .unwrap_or_else(|| path.display().to_string())
}

/// Copy one converted file to an exact destination path.
#[tauri::command]
pub async fn save_converted(source: PathBuf, destination: PathBuf) -> Result<String, FileError> {
    if let Some(parent) = destination.parent() {
        std::fs::create_dir_all(parent)
            .map_err(|_| FileError::CreateDir(parent.display().to_string()))?;
    }
    std::fs::copy(&source, &destination).map_err(|e| FileError::Copy {
        name: name_of(&source),
        message: e.to_string(),
    })?;
    Ok(destination.display().to_string())
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct SaveAllResult {
    pub saved: usize,
    pub failed: Vec<String>,
    pub directory: String,
}

/// Copy a set of converted files into a folder, without clobbering anything
/// already there.
#[tauri::command]
pub async fn save_all_converted(
    sources: Vec<PathBuf>,
    directory: PathBuf,
) -> Result<SaveAllResult, FileError> {
    std::fs::create_dir_all(&directory)
        .map_err(|_| FileError::CreateDir(directory.display().to_string()))?;

    let mut saved = 0usize;
    let mut failed = Vec::new();

    for source in &sources {
        let mut destination = directory.join(name_of(source));

        // Never silently overwrite a file the user already had.
        if destination.exists() {
            let stem = source
                .file_stem()
                .map(|s| s.to_string_lossy().to_string())
                .unwrap_or_else(|| "image".into());
            let ext = source
                .extension()
                .map(|e| format!(".{}", e.to_string_lossy()))
                .unwrap_or_default();
            let mut n = 1;
            loop {
                let candidate = directory.join(format!("{stem} ({n}){ext}"));
                if !candidate.exists() {
                    destination = candidate;
                    break;
                }
                n += 1;
            }
        }

        match std::fs::copy(source, &destination) {
            Ok(_) => saved += 1,
            Err(e) => failed.push(format!("{}: {e}", name_of(source))),
        }
    }

    Ok(SaveAllResult {
        saved,
        failed,
        directory: directory.display().to_string(),
    })
}
