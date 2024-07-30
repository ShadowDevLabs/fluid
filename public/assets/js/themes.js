import { SettingsManager } from "/assets/js/settings_manager.js";

window.settings = new SettingsManager();
window.changeTheme = (theme) => {
  const selectedTheme = document.getElementById("themeSelector").value;
  _changeTheme(selectedTheme);
  settings.set("theme", selectedTheme);
};

window._changeTheme = (theme) => {
  const root = document.documentElement;
  root.className = theme;
};

window.addEventListener("settings", async function (e) {
  if (e.key === "theme") {
    const newTheme = await settings.get("theme");
    if (newTheme) {
        _changeTheme(newTheme);
    }
  }
});

document.addEventListener("DOMContentLoaded", async () => {
  const theme = await settings.get("theme");
  if (theme) {
    _changeTheme(theme);
  }
});