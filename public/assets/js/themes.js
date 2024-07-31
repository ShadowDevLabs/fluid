import { SettingsManager } from "/assets/js/settings_manager.js";

window.settings = new SettingsManager();

window.changeTheme = () => {
  const selectedTheme = document.getElementById("themeSelector").value;
  _changeTheme(selectedTheme);
  settings.set("theme", selectedTheme);
  window.parent.postMessage({ key: "theme", value: selectedTheme }, "*");
};

window._changeTheme = (theme) => {
  const root = document.documentElement;
  root.className = theme;
};

window.addEventListener("message", (event) => {
  if (event.data.key === "theme") {
    const newTheme = event.data.value;
    _changeTheme(newTheme);
  }
});


document.addEventListener("DOMContentLoaded", async () => {
  const theme = await settings.get("theme");
  const themeSelector = document.getElementById("themeSelector");
  if (theme) {
    _changeTheme(theme);
    if (themeSelector) {
      themeSelector.value = theme;
    } 
  }
});
