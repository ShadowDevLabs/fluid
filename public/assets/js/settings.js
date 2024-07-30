import { SettingsManager } from "/assets/js/settings_manager.js";

window.settings = new SettingsManager();


export default function changeTheme() {
  const selectedTheme = document.getElementById("themeSelector").value;
  settings.set("theme", selectedTheme);
}

function _changeTheme(theme) {
  const root = document.documentElement;
  root.className = theme;
}

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
    try {
      document.getElementById("themeSelector").value = theme;
    } catch (e) {}
  }
});
