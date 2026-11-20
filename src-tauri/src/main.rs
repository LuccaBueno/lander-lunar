// Sem janela de console no Windows na versão final
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    lander_lunar_lib::run()
}
