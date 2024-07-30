import { SettingsManager } from '/assets/js/settings_manager.js';

window.settings = new SettingsManager();
settings.set("theme", "default");
console.log((await settings.get("theme")));