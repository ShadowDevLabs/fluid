import { SettingsManager } from "/assets/js/settings_manager.js";

window.settings = new SettingsManager();

function changeTheme() {
  const selectedTheme = document.getElementById("themeSelector").value;
  _changeTheme(selectedTheme);
  settings.set("theme", selectedTheme);
  const event = new CustomEvent("settings", { detail: { key: "theme" } });
  window.dispatchEvent(event);
}

function _changeTheme(theme) {
  const root = document.documentElement;
  root.className = theme;
}

window.addEventListener("settings", async function (e) {
  if (e.key === "theme") {
    console.log("Got Signal");
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

  if (window.location.pathname.endsWith("settings.html")) {
      document.getElementById("themeSelector").addEventListener("change", changeTheme);
  }
});