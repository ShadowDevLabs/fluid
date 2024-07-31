import settings from "/assets/js/settings.js";

class ShortcutsManager {
    constructor(maxShortcuts) {
        this.maxShortcuts = maxShortcuts;
        this.shortcutsContainer = document.querySelector('.shortcuts');
    }

    async loadShortcuts() {
        const shortcuts = JSON.parse(await settings.get("shortcuts")) || [];
        shortcuts.forEach(({ name, url }) => {
            const newShortcut = this.createShortcut(name, url);
            this.shortcutsContainer.insertBefore(newShortcut, document.getElementById('add-shortcut'));
        });
    }

    async addShortcut(name, url) {
        if (this.shortcutsContainer.querySelectorAll(".shortcut").length >= this.maxShortcuts) {
            alert("You've reached the maximum number of shortcuts (10). Please delete some shortcuts to add new ones.");
            return;
        }

        if (name && url) {
            const newShortcut = this.createShortcut(name, url);
            this.shortcutsContainer.insertBefore(newShortcut, document.getElementById('add-shortcut'));

            const shortcuts = JSON.parse(await settings.get("shortcuts")) || [];
            shortcuts.push({ name, url });
            await settings.set("shortcuts", JSON.stringify(shortcuts));

            document.getElementById('shortcut-modal').style.display = "none";
            document.getElementById('add-shortcut-form').reset();
        }
    }

    createShortcut(name, url) {
        const newShortcut = document.createElement("a");
        newShortcut.className = "shortcut";
        const size = 64;
        const imgSrc = `https://www.google.com/s2/favicons?domain=${url}&sz=${size}`;
        newShortcut.innerHTML = `
            <img src="${imgSrc}">
            <p>${name}</p>
        `;
        newShortcut.setAttribute("data-url", url);
        newShortcut.addEventListener("click", () => {
            const url = newShortcut.getAttribute("data-url");
            parent.Tabs.load(url);
        });
        return newShortcut;
    }

    initEventListeners() {
        document.getElementById('add-shortcut').onclick = () => {
            document.getElementById('shortcut-modal').style.display = 'block';
        };

        document.querySelector('.close').onclick = () => {
            document.getElementById('shortcut-modal').style.display = 'none';
        };

        window.onclick = (event) => {
            if (event.target === document.getElementById('shortcut-modal')) {
                document.getElementById('shortcut-modal').style.display = 'none';
            }
        };

        document.getElementById('add-shortcut-form').onsubmit = (event) => {
            event.preventDefault();
            const name = document.getElementById('shortcut-name').value;
            const url = document.getElementById('shortcut-url').value;
            this.addShortcut(name, url);
        };
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const shortcutsManager = new ShortcutsManager(10); // Init Shortcuts
    shortcutsManager.loadShortcuts(); // Load shortcuts 
    shortcutsManager.initEventListeners(); // Add event clicks
});
