document.addEventListener("keypress", (e) => {
    if(e.altKey) {
        switch(e.key) {
            case t: 
            //Alt+Shift+T Opens last tab (If enabled)
            //Alt+T Opens new tab
                if(e.shiftKey) {
                    tabs.openClosed();
                } else tabs.newTab();
                break;
            default:
                break;
        }
    }
})