import settings from "/assets/js/settings.js";

const saveCloak = async () => {
    let url = document.getElementById("cloak-url").value;
    if (!url) return;

    if (!/^https?:\/\//i.test(url)) {
        url = 'https://' + url;
        console.log(url)
    }

    try {
        const response = await fetch(`/get-title?url=${encodeURIComponent(url)}`);
        const data = await response.json();
        const tabInfo = {
            title: data.title,
            favicon: `https://t0.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=${url}&size=128`
        };
        settings.set("tab-info", tabInfo);
        window.parent.postMessage({ key: "tabInfo", value: tabInfo }, "*");
    } catch {
    }
};


const resetCloak = async () => {
    const defaultTabInfo = {
        title:"Fluid",
        favicon: "./favicon.ico"
    };
    settings.set("tab-info", defaultTabInfo);
    window.parent.postMessage({ key: "tabInfo", value: defaultTabInfo }, "*");
};

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("saveCloakBtn").addEventListener("click", saveCloak);
    document.getElementById("resetCloakBtn").addEventListener("click", resetCloak);
});
