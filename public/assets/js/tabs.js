// tabs.js
import { TabTracker } from "./tabs_manager.js";

const config = {
  // debug: true,
  proxy: "uv", //UV, Scramjet, Rammerhead, etc.
  activeClass: "active", //Classname for the active tab (applied to iframe & tab)
  tabClass: "tab", //Classname for individual tabs
  frameClass: "page-frame", //Classname for individual iframes
  iconClass: "tab-favicon", //Classname of tab icons
  closeTabClass: "tab-close", //Classname of close tab buttons
  newTabBtnId: "tab-add", //ID of new tab button
  tabContainerId: "tabs-container", //ID of tab container
  pageContainerId: "iframe-container", //ID of the iframe container
  omniboxId: "search-input", //ID of Omnibox (search bar)
  internalPrefix: "fluid://", //Internal url prefix (ex. chrome://, edge://, opera://)
  internalUrls: {
    //List of internal urls and where they point
    settings: "/settings.html",
    home: "/home.html", //Required
    new: "/new.html", //Required
  },
  history: true, //Whether or not history will be recorded
  searchTemplate: "https://google.com/search?q=%q%", //Default search engine (%q% is replaced with query)
  transport: "libcurl", //Set default transport to be used, changed with TabTracker.setTransport()
  disabledFeatures: [], //Disable features listed in features.md
};

export function initTabs() {
  console.log("Initiating tab manager");
  try {
    window.Tabs = new TabTracker(config);
    Tabs.newTab(...new Array(3), true);
    console.log("Tab tracker started successfully");
    document
      .querySelector(".tab-add")
      .addEventListener("click", () => Tabs.newTab());
    Tabs.instance = null;
    delete Tabs.instance;
  } catch (e) {
    console.error(e);
  }
}
