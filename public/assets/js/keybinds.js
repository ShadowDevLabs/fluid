function fakeKeybind(key) {
  document.dispatchEvent(new Event("keypress", { key: key, ctrlKey: true }));
} //Testing purposes

document.addEventListener("keypress", (e) => {
  console.log(`Triggering keybind for \"${e.key}\" with alt key ${e.ctrlKey}`);
  if (e.ctrlKey && e.shiftKey) {
    switch (e.key) {
      case "t":
        if (e.shiftKey)
          Tabs.openClosed(); //Alt+Shift+T Opens last tab (If enabled)
        else Tabs.newTab(); //Alt+T Opens new tab
        break;
      case "w":
        if (e.shiftKey) open(location, "_self").close();
        else Tabs.closeTab();
        //Alt+Shift+W Closes window
        //Alt+W Closes tab
        break;
      default:
        break;
    }
  }
});
