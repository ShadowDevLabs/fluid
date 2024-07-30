import { BareMuxConnection } from "/baremux/index.mjs"
const connection = new BareMuxConnection("/baremux/worker.js")

export default async function setTransport(transport, url) {
  url = url || `wss://${location.origin}/wisp/`;
  switch (transport) {
    case "libcurl":
      await connection.setTransport("/libcurl/index.mjs", [{ wisp: url }]);
      break;
    case "epoxy":
      console.log(connection);
      await connection.setTransport("/epoxy/index.mjs", [{ wisp: url }]);
      break;
    default:
      await connection.setTransport(transport, [{ wisp: url }]);
      break;
  }
}
