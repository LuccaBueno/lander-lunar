#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        // reiniciar o app depois de instalar uma atualização
        .plugin(tauri_plugin_process::init())
        .setup(|app| {
            // buscar e instalar atualizações publicadas nas Releases do GitHub
            #[cfg(desktop)]
            app.handle().plugin(tauri_plugin_updater::Builder::new().build())?;
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("erro ao iniciar o Lander Lunar");
}
