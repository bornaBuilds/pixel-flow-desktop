//! Commands the webview can invoke.

use serde_json::json;
use tauri::{AppHandle, Manager};

use crate::sidecar::{self, Sidecar, SidecarError};

/// Milestone 2 acceptance check: prove the sidecar started and that sharp
/// resolved its native module. Exposed so a *packaged* app can be verified
/// without a terminal, which is where this would otherwise fail silently.
#[tauri::command]
pub async fn engine_status(app: AppHandle) -> Result<serde_json::Value, SidecarError> {
    let ready = app.state::<Sidecar>().ready.lock().unwrap().clone();
    let versions = sidecar::request(&app, json!({ "op": "versions" })).await?;
    Ok(json!({ "ready": ready, "roundTrip": versions }))
}
