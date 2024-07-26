import { SetTransport } from "/baremux/index.js";

export function setTransport(transport, url) {
    url = url || `wss://${location.origin}`
    switch(transport) {
        case "libcurl":
            SetTransport("CurlMod.LibcurlClient", { wisp: url}); 
            break;
        case "epoxy":
            SetTransport("EpxMod.EpoxyClient", { wisp: url});
            break;
        default:
            SetTransport(transport, { wisp: url });
            break;
    }
}