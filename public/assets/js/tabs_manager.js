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
// import { setTransports } from "./transport.js";


export class TabTracker {
    constructor(config) {
        this.skip = (num) => new Array(num);
        let defaultConfig = {
            "debug": false,
            "proxy": "uv", //UV, Scramjet, Rammerhead, etc.
            "defaultTab": "#default-tab", //Default tab container to clone, any selector
            "activeClass": "active", //Classname for the active tab (applied to iframe & tab)
            "tabClass": "tab", //Classname for individual tabs
            "frameClass": "page-frame",  //Classname for individual iframes
            "iconClass": "tab-icon", //Classname of tab icons 
            "closeTabClass": "close-tab-btn", //Classname of close tab buttons
            "newTabBtnId": "new-tab-btn", //ID of new tab button
            "tabContainerId": "tabs-container", //ID of tab container
            "pageContainerId": "frame-container", //ID of the iframe container
            "omniboxId": "search-bar", //ID of Omnibox (search bar)
            "internalPrefix": "tabs://", //Internal url prefix (ex. chrome://, edge://, opera://)
            "internalUrls": { //List of internal urls and where they point
                "settings": "/settings.html", 
                "home": "/home.html", //Required
                "new": "/new.html"    //Required
                //Add any tabs:// urls
            }, 
            "history": true, //Weither or not history will be recorded
            "searchTemplate": "https://google.com/search?q=%q%", //Default search engine (%q% is replaced with query)
            "transport": "epoxy",  //Set default transport to be used, changed with TabTracker.setTransport()
            "disabledFeatures": [] //Disable features listed in features.md
        };
        this.config = {...defaultConfig, ...config}; 
        if(this.config.debug) {
            if(this.config.debug) console.log("Starting Tab Tracker with debug mode ON");
            if(this.config.debug) console.log(this.config)
        }
        else if(this.config.debug) console.log("Starting Tab Tracker!")
        this.activeTabIndex = 0;
        this.tabsArr = [];
        // this.setTransport = setTransports;
        this.forward = (index) => this.tabsArr[index || this.activeTabIndex].iframe.contentWindow.history.forward(); 
        this.backward = (index) => this.tabsArr[index || this.activeTabIndex].iframe.contentWindow.history.back();
        this.fullscreen = (index) => this.tabsArr[index || this.activeTabIndex].iframe.requestFullscreen();
        this.history = this.config.history ? [] : false;
        document.getElementById(this.config.omniboxId).onkeydown = (e) => {
            if(e.key === "Enter") {
                e.preventDefault();       
                let omnibox = document.getElementById(this.config.omniboxId);
                if(e.shiftKey) this.newTab(this.parseQuery(omnibox.value), undefined, true);
                else this.load(omnibox.value);
            } 
        }
        this.loaded = true;
    }

    load(url, index) {
        if(!url) throw Error("Missing url in load call");
        index = index || this.activeTabIndex;
        url = this.parseQuery(url);
        const obj = this.tabsArr[index];
        obj.iframe.src = url;
        obj.iframe.onload = () => obj.tab.children[0].querySelector(`.${this.config.iconClass}`).src = this.getFavicon(url);
        const name = obj.iframe.contentDocument.title || obj.name || "";
        obj.name = name;
        obj.tab.children[0].querySelector("span").textContent = name;
    }

    newTab(url, index, noSwitch, initial) {
        url = url || this.tabsArr.length > 0 ? this.config.internalPrefix + "new" : this.config.internalPrefix + "home"; //Set default urls
        index = index || this.tabsArr.length; //Last position by default
        initial = initial || false
        let newTab = document.querySelector(this.config.defaultTab).children[0].cloneNode(true);
        let obj = {
            "url": url,
            "name": "Loading...",
            "icon": "/loading.png",
            "index": index,
            "tab": newTab,
            "iframe": document.createElement('iframe'),
            "active": false,
            "isInitial": initial 
        };

        document.getElementById(this.config.pageContainerId).append(obj.iframe);
        document.getElementById(this.config.tabContainerId).insertBefore(newTab, document.getElementById(this.config.newTabBtnId));
        this.tabsArr.push(obj);
        const closeBtn = obj.tab.querySelector(`.${this.config.closeTabClass}`);
        closeBtn.addEventListener('click', () => this.closeTab(this.tabsArr.findIndex(item => item.tab === closeBtn.parentElement)));
        if(!noSwitch) this.switchTab(index);
        this.load(url, index);
    };

    openClosed() {
        let closedTab = this.history[0].url;
        this.newTab(closedTab);  
    };

    switchTab(index) {
        if(this.config.debug) console.log(index)
        if(isNaN(index)) throw Error("Switching tab requires an index")
        if(index < 0) {
            this.newTab(); 
            console.log("Switching tab due to index below 0")
            return;
        }
        try {
            this.tabsArr[this.activeTabIndex].tab.classList.remove("active");
            this.tabsArr[this.activeTabIndex].iframe.classList.remove("active");
            this.tabsArr[this.activeTabIndex].active = false;
        } catch{} //Silence error on first tab
        if(this.config.debug) console.log(this.tabsArr[index])
        this.tabsArr[index].tab.classList.add("active");
        this.tabsArr[index].iframe.classList.add("active");
        this.tabsArr[index].active = true;
        this.activeTabIndex = index;
        document.getElementById(this.config.omniboxId).value = this.tabsArr[index].src;
    }

    closeTab(index) {
        if(this.activeTabIndex === index) {
            let newIndex = (this.tabsArr.length - 1) === index ? index - 1 : index; //Determine new tab
            if(this.config.debug) console.log("New index: "+newIndex)
            this.switchTab(newIndex);
        }
        this.tabsArr[index].iframe.remove();
        this.tabsArr[index].tab.remove();
        this.tabsArr.splice(index, 1);
    };

    saveTabs() {
        
    };

    parseQuery(query) {
        if(this.config.debug) console.log(`Parsing: ${query}`)
        let internalUrls = this.config.internalUrls;
        if(query.startsWith(this.config.internalPrefix) && internalUrls[query.replace(this.config.internalPrefix, "")]) {
            //Internal url
            if(this.config.debug) console.log(`Parsed internal URL: ${internalUrls[query.replace(this.config.internalPrefix, "")]}`)
            return internalUrls[query.replace(this.config.internalPrefix, "")];
        } else {
            try { return encode(toString(new URL(url))); } catch(e){} //Regular
            try { return encode(toString(new URL("https:/\/",url))); } catch(e){} // https:// added
            try { return encode(this.config.searchTemplate.replace("%s%", "query"));} catch(e){} //Search engine
        }
    };

    moveTab(prevIndex, newIndex) {
        try {
            const original = this.tabsArr[prevIndex];
            this.tabsArr.splice(newIndex, 0, original);
            this.tabsArr.splice(prevIndex, 1);
            switchTab(newIndex);
        } catch(e) {
           throw Error("Error thrown when moving tab:\n",e);
        };
    };

    getFavicon(url, index) {
        index = index || this.activeTabIndex;
        url = url || this.tabsArr[index].url;
        let favicon;
        let nodeList = this.tabsArr[index].iframe.contentDocument.getElementsByTagName("link");
        for (let i = 0; i < nodeList.length; i++) {
            if(nodeList[i].getAttribute("rel") == "icon" || nodeList[i].getAttribute("rel") == "shortcut icon") {
                return favicon = nodeList[i].getAttribute("href");
            }
        }
        return `https:/\/t2.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=${url}&size=32`
    };

    encode(string) {
        switch(this.config.proxy) {
            case "uv":
                return __uv$config.encodeURL(string);
                break;
            case "scramjet":
                return __scramjet$config.encodeURL(string);
                break;
            default:
                break;
        }
        return string
    };

    middleware() {

    };

}
