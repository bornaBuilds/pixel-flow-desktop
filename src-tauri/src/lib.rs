mod commands;
mod convert;
mod files;
mod sidecar;

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
        "vah264dec",
        "vah265dec",
        "vavp8dec",
        "vavp9dec",
        "vaav1dec",
        "vah264lpdec",
        "vah265lpdec",
        "vavp9lpdec",
        "vaav1lpdec",
        "vaapih264dec",
        "vaapih265dec",
        "vaapivp8dec",
        "vaapivp9dec",
        "vaapiav1dec",
        "vulkanh264dec",
        "vulkanh265dec",
        "nvh264dec",
        "nvh265dec",
        "nvvp9dec",
        "nvav1dec",
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
        .manage(sidecar::Sidecar::default())
        .invoke_handler(tauri::generate_handler![
            commands::engine_status,
            convert::convert_images,
            files::save_converted,
            files::save_all_converted,
        ])
        .setup(|app| {
            // Registered in release too: this app has no server, so a log file
            // is the only way to diagnose a user's "it did nothing" report.
            app.handle().plugin(
                tauri_plugin_log::Builder::default()
                    .level(log::LevelFilter::Info)
                    .targets([
                        tauri_plugin_log::Target::new(tauri_plugin_log::TargetKind::Stdout),
                        tauri_plugin_log::Target::new(tauri_plugin_log::TargetKind::LogDir {
                            file_name: Some("pixelflow".into()),
                        }),
                    ])
                    .build(),
            )?;
            // A failure here must not take the window down: the thumbnail
            // generator does not need the sidecar, and the UI reports the
            // error via engine_status.
            if let Err(error) = sidecar::start(app.handle()) {
                log::error!("image engine failed to start: {error}");
            }
            Ok(())
        })
        .build(tauri::generate_context!())
        .expect("error while building tauri application")
        .run(|app, event| {
            if let tauri::RunEvent::ExitRequested { .. } = event {
                sidecar::shutdown(app);
            }
        });
}
