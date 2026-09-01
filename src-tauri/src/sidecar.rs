//! Supervises the Node + sharp sidecar.
//!
//! The child is spawned once and kept alive for the session. Requests and
//! responses are newline-delimited JSON, correlated by an `id` field, so
//! several conversions can be in flight at once and complete out of order.

use std::collections::HashMap;
use std::sync::atomic::{AtomicU64, Ordering};
use std::sync::Mutex;

use serde_json::{json, Value};
use tauri::path::BaseDirectory;
use tauri::{AppHandle, Manager};
use tauri_plugin_shell::process::{CommandChild, CommandEvent};
use tauri_plugin_shell::ShellExt;
use tokio::sync::oneshot;

#[derive(Debug, thiserror::Error)]
pub enum SidecarError {
    #[error("could not locate the sidecar script: {0}")]
    ScriptMissing(String),
    #[error("could not start the image engine: {0}")]
    Spawn(String),
    #[error("the image engine is not running")]
    NotRunning,
    #[error("the image engine stopped before replying")]
    Dropped,
    #[error("{0}")]
    Remote(String),
}

impl serde::Serialize for SidecarError {
    fn serialize<S: serde::Serializer>(&self, s: S) -> Result<S::Ok, S::Error> {
        s.serialize_str(&self.to_string())
    }
}

#[derive(Default)]
pub struct Sidecar {
    child: Mutex<Option<CommandChild>>,
    pending: Mutex<HashMap<String, oneshot::Sender<Value>>>,
    next_id: AtomicU64,
    /// Filled from the sidecar's unsolicited `{"op":"ready"}` frame.
    pub ready: Mutex<Option<Value>>,
}

impl Sidecar {
    fn settle(&self, id: &str, payload: Value) {
        if let Some(tx) = self.pending.lock().unwrap().remove(id) {
            let _ = tx.send(payload);
        }
    }

    /// Fail every in-flight request instead of leaving callers hanging forever.
    fn fail_all(&self) {
        self.pending.lock().unwrap().clear();
        *self.child.lock().unwrap() = None;
    }
}

/// Spawn the sidecar and start pumping its stdout.
pub fn start(app: &AppHandle) -> Result<(), SidecarError> {
    // The `resources` map in tauri.conf.json rewrites resources/sidecar ->
    // sidecar/, so this is the in-bundle path, not the source path.
    let script = app
        .path()
        .resolve("sidecar/index.cjs", BaseDirectory::Resource)
        .map_err(|e| SidecarError::ScriptMissing(e.to_string()))?;

    if !script.exists() {
        return Err(SidecarError::ScriptMissing(format!(
            "{} does not exist — run `node scripts/build-sidecar.mjs`",
            script.display()
        )));
    }

    let (mut rx, child) = app
        .shell()
        .sidecar("pixelflow-node")
        .map_err(|e| SidecarError::Spawn(e.to_string()))?
        .arg(script.to_string_lossy().to_string())
        // Never pick up a system libvips that happens to be installed.
        .env("SHARP_IGNORE_GLOBAL_LIBVIPS", "1")
        .env("UV_THREADPOOL_SIZE", "8")
        .spawn()
        .map_err(|e| SidecarError::Spawn(e.to_string()))?;

    *app.state::<Sidecar>().child.lock().unwrap() = Some(child);

    let handle = app.clone();
    tauri::async_runtime::spawn(async move {
        let state = handle.state::<Sidecar>();
        while let Some(event) = rx.recv().await {
            match event {
                CommandEvent::Stdout(bytes) => {
                    let line = String::from_utf8_lossy(&bytes);
                    for frame in line.lines().filter(|l| !l.trim().is_empty()) {
                        match serde_json::from_str::<Value>(frame) {
                            Ok(value) => {
                                if value.get("op").and_then(Value::as_str) == Some("ready") {
                                    log::info!("image engine ready: {value}");
                                    *state.ready.lock().unwrap() = Some(value);
                                } else if let Some(id) =
                                    value.get("id").and_then(Value::as_str).map(String::from)
                                {
                                    state.settle(&id, value);
                                }
                            }
                            // A non-JSON line means something wrote to stdout that
                            // should have gone to stderr. Loud, because it corrupts
                            // the protocol.
                            Err(e) => log::error!("unparseable sidecar frame ({e}): {frame}"),
                        }
                    }
                }
                CommandEvent::Stderr(bytes) => {
                    let line = String::from_utf8_lossy(&bytes);
                    let line = line.trim();
                    if !line.is_empty() {
                        log::warn!("sidecar: {line}");
                    }
                }
                CommandEvent::Terminated(status) => {
                    log::error!("sidecar exited: {status:?}");
                    state.fail_all();
                    break;
                }
                _ => {}
            }
        }
    });

    Ok(())
}

/// Send one request and await its reply.
pub async fn request(app: &AppHandle, mut payload: Value) -> Result<Value, SidecarError> {
    let state = app.state::<Sidecar>();

    let id = state.next_id.fetch_add(1, Ordering::Relaxed).to_string();
    payload["id"] = json!(id);

    let (tx, rx) = oneshot::channel();
    state.pending.lock().unwrap().insert(id.clone(), tx);

    let frame = format!("{payload}\n");
    {
        let mut guard = state.child.lock().unwrap();
        let child = guard.as_mut().ok_or(SidecarError::NotRunning)?;
        if let Err(e) = child.write(frame.as_bytes()) {
            state.pending.lock().unwrap().remove(&id);
            return Err(SidecarError::Spawn(e.to_string()));
        }
    }

    let reply = rx.await.map_err(|_| SidecarError::Dropped)?;

    if reply.get("ok").and_then(Value::as_bool) == Some(true) {
        Ok(reply)
    } else {
        Err(SidecarError::Remote(
            reply
                .get("error")
                .and_then(Value::as_str)
                .unwrap_or("unknown image engine error")
                .to_string(),
        ))
    }
}

/// Kill the child so it does not outlive the app.
pub fn shutdown(app: &AppHandle) {
    if let Some(child) = app.state::<Sidecar>().child.lock().unwrap().take() {
        let _ = child.kill();
    }
}
