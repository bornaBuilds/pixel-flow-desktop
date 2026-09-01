fn main() {
    // Without this, `bundle.resources` added after the first build are silently
    // stale in `tauri dev` — the sidecar's node_modules is exactly that case.
    println!("cargo:rerun-if-changed=resources");
    tauri_build::build()
}
