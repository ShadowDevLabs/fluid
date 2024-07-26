import { SettingsManager } from "./settings_manager.js"

document.onload = () => {
    let browser = SettingsManager.get("browser");
    document.getElementsByTagName("head")[0].getElementById('browser-link').href = `/assets/css/${browser}.css`
    document.getElementById("loading-page").style.display = "none;"
}