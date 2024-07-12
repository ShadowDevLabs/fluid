import { SetTransport } from "../../baremux/bare";

export function setTransport(transport, url) {
    switch(transport) {
        case "libcurl":
            SetTransport("CurlMod.LibcurlClient", { wisp: url || `wss://${location.origin}` }); 
            break;
        case "epoxy":
            SetTransport("EpxMod.EpoxyClient", { wisp: url || `wss://${location.origin}` });
            break;
        default:
            SetTransport(transport, { wisp: url || `wss://${location.origin}` });
            break;
    }
}