/*
Default tab object:
{
"url": "",          //URL stored as string 
"name": "",         //Name of tab, overrideable by user
"icon": "",         //Icon of tab, overrideable by user
"index": 0,         //Position of tab
"tab": element,     //Element of tab in top bar
"iframe": element,  //Element of iframe in iframe-container
"active": true,     //Keep track of active tab
"isInitial": true   //Keep track of the first tab (fixes tab persistance issues)
}
// */

import setTransport from "./transport.js";

export class TabTracker {
  constructor(config) {
    this.skip = (num) => new Array(num);

    for (const [key, value] of Object.entries(config)) {
      if (value === "") {
        throw new TypeError(`Provided empty config at key: ${key}`);
      }
    }

    let defaultConfig = {
      debug: false,
      proxy: "uv", //UV, Scramjet, Rammerhead, etc.
      swPrefix: "~", //Prefix for service worker
      wispUrl: `wss://${location.origin}/wisp/`, //Wisp url, local or external
      defaultTab: "#default-tab", //Default tab container to clone, any selector
      activeClass: "active", //Classname for the active tab (applied to iframe & tab)
      tabClass: "tab", //Classname for individual tabs
      frameClass: "page-frame", //Classname for individual iframes
      iconClass: "tab-icon", //Classname of tab icons
      closeTabClass: "close-tab-btn", //Classname of close tab buttons
      newTabBtnId: "new-tab-btn", //ID of new tab button
      tabContainerId: "tabs-container", //ID of tab container
      pageContainerId: "frame-container", //ID of the iframe container
      omniboxId: "search-bar", //ID of Omnibox (search bar)
      internalPrefix: "tabs://", //Internal url prefix (ex. chrome://, edge://, opera://)
      internalUrls: {
        //List of internal urls and where they point
        settings: "/settings.html",
        home: "/home.html", //Required
        new: "/new.html", //Required
        //Add any tabs:// urls
      },
      history: true, //Weither or not history will be recorded
      searchTemplate: "https://google.com/search?q=%q%", //Default search engine (%q% is replaced with query)
      transport: "libcurl", //Set default transport to be used, changed with TabTracker.setTransport()
      disabledFeatures: [], //Disable features listed in features.md
    };
    this.config = { ...defaultConfig, ...config };
    this.proxyPrefix = {
      uv: "uv",
      scramjet: "scram",
    };
    if (this.config.debug) {
      if (this.config.debug)
        console.log("Starting Tab Tracker with debug mode ON");
      if (this.config.debug) console.log(this.config);
    } else if (this.config.debug) console.log("Starting Tab Tracker!");
    this.activeTabIndex = 0;
    this.tabsArr = [];
    // this.setTransport = setTransports;
    this.forward = (index) =>
      this.tabsArr[
        index || this.activeTabIndex
      ].iframe.contentWindow.history.forward();
    this.backward = (index) =>
      this.tabsArr[
        index || this.activeTabIndex
      ].iframe.contentWindow.history.back();
    this.fullscreen = (index) =>
      this.tabsArr[index || this.activeTabIndex].iframe.requestFullscreen();
    this.history = this.config.history ? [] : false;
    document.getElementById(this.config.omniboxId).onkeydown = (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        let omnibox = document.getElementById(this.config.omniboxId);
        if (e.shiftKey)
          this.newTab(this.parseQuery(omnibox.value), undefined, true);
        else this.load(omnibox.value);
      }
    };
    try {
      setTransport(this.config.transport, this.config.wispUrl);
      if ("serviceWorker" in navigator) {
        navigator.serviceWorker
          .register("/sw.js", { scope: `/${this.config.swPrefix}/` })
          .then(
            (registration) => {
              console.log(
                "Service worker registration succeeded:",
                registration
              );
            },
            (error) => {
              console.error(`Service worker registration failed: ${error}`);
            }
          );
      } else {
        console.error("Service workers are not supported.");
      }
    } catch (e) {
      console.error(`Issue registering service worker: ${e}`);
    }

    this.loaded = true;
  }

  load(url, index) {
    if (!url) throw Error("Missing url in load call");
    index = index || this.activeTabIndex;
    const parsedUrl = this.parseQuery(url);
    const obj = this.tabsArr[index];
    obj.iframe.src = parsedUrl;
    obj.iframe.onload = () =>
      (obj.tab.children[0].querySelector(`.${this.config.iconClass}`).src =
        this.getFavicon(url));
    const name = obj.iframe.contentDocument.title || obj.name || "";
    obj.name = name;
    obj.tab.children[0].querySelector("span").textContent = name;
  }

  newTab(url, index, noSwitch, initial) {
    url =
      url || this.tabsArr.length > 0
        ? this.config.internalPrefix + "new"
        : this.config.internalPrefix + "home"; //Set default urls
    index = index || this.tabsArr.length; //Last position by default
    initial = initial || false;
    let newTab = document
      .querySelector(this.config.defaultTab)
      .children[0].cloneNode(true);
    let obj = {
      url: url,
      name: "Loading...",
      icon: "/loading.png",
      index: index,
      tab: newTab,
      iframe: document.createElement("iframe"),
      active: false,
      isInitial: initial,
    };
    newTab.addEventListener("click", (e) => {
      if (
        e.target.classList.contains("tab") ||
        e.target.classList.contains("tab-name")
      ) {
        const thisIndex = this.tabsArr.findIndex(
          (item) => item.tab === e.currentTarget
        );
        this.switchTab(thisIndex);
      }
    });
    document.getElementById(this.config.pageContainerId).append(obj.iframe);
    document
      .getElementById(this.config.tabContainerId)
      .insertBefore(newTab, document.getElementById(this.config.newTabBtnId));
    this.tabsArr.splice(index, 0, obj);
    const closeBtn = obj.tab.querySelector(`.${this.config.closeTabClass}`);
    closeBtn.addEventListener("click", () =>
      this.closeTab(
        this.tabsArr.findIndex((item) => item.tab === closeBtn.parentElement)
      )
    );
    if (!noSwitch) {
      this.switchTab(index);
    }
    this.load(url, index);
  }

  openClosed() {
    let closedTab = this.history[0].url;
    this.newTab(closedTab);
  }

  switchTab(index) {
    if (this.config.debug) console.log(`Switching to index ${index}`);
    if (isNaN(index)) throw Error("Switching tab requires an index");
    if (index < 0) {
      this.newTab();
      console.log(`Creating tab due to index ${index}`);
      return;
    }
    if (this.tabsArr.length > 1) {
      if (this.config.debug)
        console.log(
          `Trying to remove active tabs, active tab index is ${this.activeTabIndex}`
        );
      this.tabsArr[this.activeTabIndex].tab.classList.remove("active");
      this.tabsArr[this.activeTabIndex].iframe.classList.remove("active");
      this.tabsArr[this.activeTabIndex].active = false;
    }
    if (this.config.debug) console.log(this.tabsArr[index]);
    this.tabsArr[index].tab.classList.add("active");
    this.tabsArr[index].iframe.classList.add("active");
    this.tabsArr[index].active = true;
    this.activeTabIndex = index;
    document.getElementById(this.config.omniboxId).value =
      this.tabsArr[index].url;
  }

  closeTab(index) {
    console.log(`Closing tab at index ${index}`);
    index = index || this.activeTabIndex;
    const newIndex = this.tabsArr.length - 1 === index ? index - 1 : index; //Determine new tab
    if (this.config.debug)
      console.log(`New index: ${newIndex < 0 ? 0 : newIndex}`);
    const oldActiveTabIndex = this.activeTabIndex;
    this.activeTabIndex = newIndex < 0 ? 0 : newIndex;
    this.tabsArr[index].iframe.remove();
    this.tabsArr[index].tab.remove();
    this.tabsArr.splice(index, 1);
    if (oldActiveTabIndex === index) this.switchTab(newIndex);
  }

  saveTabs() {}

  parseQuery(query) {
    if (this.config.debug) console.log(`Parsing: ${query}`);
    let internalUrls = this.config.internalUrls;
    if (
      query.startsWith(this.config.internalPrefix) &&
      this.config.internalUrls[query.replace(this.config.internalPrefix, "")]
    ) {
      //Internal url
      if (this.config.debug)
        console.log(
          `Parsed internal URL: ${
            this.config.internalUrls[
              query.replace(this.config.internalPrefix, "")
            ]
          }`
        );
      return this.config.internalUrls[
        query.replace(this.config.internalPrefix, "")
      ];
    } else {
      try {
        // Attempt to encode the URL as-is
        return `/${this.config.swPrefix}/${
          this.proxyPrefix[this.config.proxy]
        }/${this.encode(new URL(url).toString())}`;
      } catch (e) {
        // If the above fails, try with "https://" prefix
        try {
          return `/${this.config.swPrefix}/${
            this.proxyPrefix[this.config.proxy]
          }/${this.encode(new URL(url, "https://").toString())}`;
        } catch (e) {
          // If both above fail, fall back to the search engine template
          return `/${this.config.swPrefix}/${
            this.proxyPrefix[this.config.proxy]
          }/${this.encode(this.config.searchTemplate.replace("%q%", query))}`;
        }
      }
    }
  }

  moveTab(prevIndex, newIndex) {
    try {
      const original = this.tabsArr[prevIndex];
      this.tabsArr.splice(newIndex, 0, original);
      this.tabsArr.splice(prevIndex, 1);
      switchTab(newIndex);
    } catch (e) {
      throw Error("Error thrown when moving tab:\n", e);
    }
  }

  getFavicon(url, index) {
    index = index || this.activeTabIndex;
    url = url || this.tabsArr[index].url;
    let favicon;
    let nodeList =
      this.tabsArr[index].iframe.contentDocument.getElementsByTagName("link");
    for (let i = 0; i < nodeList.length; i++) {
      if (
        nodeList[i].getAttribute("rel") == "icon" ||
        nodeList[i].getAttribute("rel") == "shortcut icon"
      ) {
        return (favicon = nodeList[i].getAttribute("href"));
      }
    }
    return `https:/\/t2.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://${url}&size=32`;
  }

  encode(string) {
    switch (this.config.proxy) {
      case "uv":
        return __uv$config.encodeUrl(string);
        break;
      case "scramjet":
        return __scramjet$config.codec.encode(string);
        break;
      default:
        break;
    }
    return string;
  }

  decode(string) {
    switch (this.config.proxy) {
      case "uv":
        return __uv$config.decodeUrl(string);
        break;
      case "scramjet":
        return __scramjet$config.codec.decode(string);
        break;
      default:
        break;
    }
    return string;
  }

  middleware() {
    //Maybe?
  }
}
