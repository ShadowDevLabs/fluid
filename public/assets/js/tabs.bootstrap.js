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
*/
import { setTransports } from "./transport.js";


export class TabTracker {
    constructor(config) {
        let defaultConfig = {
            "proxy": "uv", //UV, Scramjet, Rammerhead, etc.
            "activeClass": "active", //Classname for the active tab (applied to iframe & tab)
            "tabClass": "tab", //Classname for individual tabs
            "frameClass": "page-frame",  //Classname for individual iframes
            "iconClass": "tab-icon", //Classname of tab icons 
            "closeTabClass": "close-tab-btn", //Classname of close tab buttons
            "newTabBtnId": "new-tab-btn", //ID of new tab button
            "tabContainerId": "tabs-container", //ID of tab container
            "pageContainerId" : "frame-container", //ID of the iframe container
            "internalPrefix": "tabs://", //Internal url prefix (ex. chrome://, edge://, opera://)
            "internalUrls": { //List of internal urls and where they point
                "settings": "/settings.html", 
                "home": "/home.html", //Required
                "new": "/new.html"    //Required
                //Add any tabs:// urls
            }, 
            "searchTemplate": "https://google.com/search?q=%q%", //Default search engine (%q% is replaced with query)
            "transport": "epoxy",  //Set default transport to be used, changed with TabTracker.setTransport()
            "disabledFeatures": [] //Disable features listed in features.md
        };
        this.config = {...config, ...defaultConfig}; 
        this.activeTabIndex = 0;
        this.tabsArr = [];
        this.setTransport = setTransports;
        this.forward = (index) => this.tabsArr[index || this.activeTabIndex].iframe.contentWindow.history.forward(); 
        this.backward = (index) => this.tabsArr[index || this.activeTabIndex].iframe.contentWindow.history.back();
        this.fullscreen = (index) => this.tabsArr[index || this.activeTabIndex].iframe.requestFullscreen();
        this.newTab(...skip(2), true)
        this.skip = (num) => new Array(num);

    }

    load(url, index) {
        if(!url) throw Error("Missing url in load call");
        index = index || this.activeTabIndex;
        url = this.parseQuery(url);
        let tabObj = this.tabsArr[index];
        tabObj.tab.querySelector(".",this.config.iconClass).src = this.getFavicon(url);
        tabObj.iframe.src = url;
    }

    newTab(url, index, willSwitch) {
        url = url || this.tabsArr.length > 0 ? this.config.internalPrefix + "new" : this.config.internalPrefix + "home"; //Set default urls
        index = index || this.tabsArr.length; //Last position by default
        //Create new tab elements
        let tab = document.createElement("div");
        tab.className = this.config.tabClass;
        document.querySelector("#",this.config.tabContainerId).appendChild(tab);
        let icon = document.createElement("img");
        tab.appendChild(icon);
        let name = document.createElement("span");
        name.textContent = "Loading..."
        let frame = document.createElement("iframe");
        frame.className = this.config.frameClass;
        if(willSwitch) {
            this.switchTab()
        }
        this.load(url, index);
    };

    switchTab(index) {
        if(!index) throw Error("Switching tab requires an index")
        if(index < 0) {
            this.newTab(...skip(2), true); 
            return;
        }
        this.tabsArr(this.activeTabIndex).tab.classList.remove("active");
        this.tabsArr(this.activeTabIndex).iframe.classList.remove("active");
        this.tabsArr(this.activeTabIndex).active = false;
        this.tabsArr(index).tab.classList.add("active");
        this.tabsArr(index).iframe.classList.add("active");
        this.tabsArr(index).active = true;
        this.activeTabIndex = index;
    }

    closeTab(index) {
        if(this.activeTabIndex === index) {
            let newIndex = this.tabsArr.length - 1 === index ? index - 1 : index; //Determine new tab
            switchTab(newIndex);
        }
        this.tabsArr[index].iframe.remove();
        this.tabsArr[index].tab.remove();
        this.tabsArr.splice(index, 1);
    };

    saveTabs() {

    };

    parseQuery(query) {
        if(query.startsWith(this.config.internalPrefix) && internalUrls[query.replace(this.config.internalPrefix, "")]) {
            //Internal url
            return internalUrls[query.replace(this.config.internalPrefix, "")];
        } else {
            try { return encode(toString(new URL(url))); } catch(e){} //Regular
            try { return encode(toString(new URL("https:/\/",url))); } catch(e){} // https:// added
            try { return encode(toString(new URL("http:/\/",url))); } catch(e){} // http:// added
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
            console.warn("Error thrown when moving tab:\n",e);
        };
    };

    getFavicon(index, url) {
        index = index || this.activeTabIndex;
        url = url || this.tabsArr[index].url;
        let favicon;
        let nodeList = tabsArr[index].iframe.contentDocument.getElementsByTagName("link");
        for (let i = 0; i < nodeList.length; i++) {
            if(nodeList[i].getAttribute("rel") == "icon" || nodeList[i].getAttribute("rel") == "shortcut icon") {
                return favicon = nodeList[i].getAttribute("href");
            }
        }
        return 
    }

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
    }

}
