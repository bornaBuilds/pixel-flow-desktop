#[cfg(target_os = "linux")]
fn work_around_webkitgtk_hardware_decode() {
    // WebKitGTK routes WebCodecs through GStreamer. On machines with a VA-API
    // decoder the hardware element outranks the software one (e.g. vah264dec is
    // rank 257 vs avdec_h264 at 256), so it wins element negotiation and hands
    // WebKit a DMA-BUF backed VideoFrame. WebKit cannot map that buffer for
    // canvas readback, so `ctx.drawImage(frame)` yields a uniform green image —
    // YUV(0,0,0) converted to RGB — instead of the decoded picture.
    //
    // Demote the hardware decoders so the software ones win. This app only
    // decodes a handful of frames per video, so losing hardware acceleration
    // costs little and correctness matters more.
    //
    // Respect an existing value: if the user set this deliberately, leave it.
    const KEY: &str = "GST_PLUGIN_FEATURE_RANK";
    if std::env::var_os(KEY).is_some() {
        return;
    }
    let demoted = [
        "vah264dec", "vah265dec", "vavp8dec", "vavp9dec", "vaav1dec",
        "vah264lpdec", "vah265lpdec", "vavp9lpdec", "vaav1lpdec",
        "vaapih264dec", "vaapih265dec", "vaapivp8dec", "vaapivp9dec", "vaapiav1dec",
        "vulkanh264dec", "vulkanh265dec",
        "nvh264dec", "nvh265dec", "nvvp9dec", "nvav1dec",
    ]
    .map(|name| format!("{name}:0"))
    .join(",");
    std::env::set_var(KEY, demoted);
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    #[cfg(target_os = "linux")]
    work_around_webkitgtk_hardware_decode();

    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_shell::init())
        .setup(|app| {
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
