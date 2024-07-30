import settings from "/assets/js/settings.js";

const saveCloak = async () => {
    const url = document.getElementById("cloak-url").value;
    if (!url) return;

    try {
        const response = await fetch(`/get-title?url=${encodeURIComponent(url)}`);
        const data = await response.json();
        settings.set("tab-title", data.title);
        settings.set("tab-favicon", `https://t0.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=${url}&size=128`)
    } catch {
    }
};

const resetCloak = () => {
    
};

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("saveCloakBtn").addEventListener("click", saveCloak);
    document.getElementById("resetCloakBtn").addEventListener("click", resetCloak);
});
