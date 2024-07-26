import compression from "compression";
import express from "express";
import wisp from "wisp-server-node";
import { createBareServer } from '@tomphttp/bare-server-node';
import { baremuxPath } from "@mercuryworkshop/bare-mux/node";
import { createServer } from "http";
import { fileURLToPath } from "url";
import { join } from "path";
const version = process.env.npm_package_version
const publicPath = fileURLToPath(new URL("./public/", import.meta.url));
let port = 8080;
const app = express();
const server = createServer();
const bare = createBareServer("/bare/");
app.use(compression());
app.use(express.static(publicPath, { 
  extensions: ['html'],
  maxAge: 604800000 
})); 
app.use("/baremux/", express.static(baremuxPath));

app.use("/privacy", express.static(publicPath + '/privacy.html'));

app.get("/version", (req, res) => {
    if(req.query.v && req.query.v != version) {
      res.status(400).send(version);
      return
    }
  res.status(200).send(version);
})
  
  app.get("/search-api", async (req, res) => {
    const response = await fetch(`http://api.duckduckgo.com/ac?q=${req.query.term}&format=json`).then((i) => i.json());
    res.send(response);
})
  
  app.get("/user-agents", async (req, res) => {
      let text = await fetch("https://useragents.me/")
      text = await text.text()
      const $ = cheerio.load(text)
      res.send($('#most-common-desktop-useragents-json-csv > div:eq(0) > textarea').val())
  })
  
  app.use((req, res) => {
    res.status(404);
    res.sendFile(join(publicPath, "404.html"));
  });
  
  server.on("request", (req, res) => {
    res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
    if (bare.shouldRoute(req)) {
      bare.routeRequest(req, res);
    } else {
    app(req, res);
    }
  });
  
  server.on("upgrade", (req, socket, head) => {
    if (bare.shouldRoute(req)) {
      bare.routeUpgrade(req, socket, head);
    } else if (req.url.endsWith("/wisp/"))
      wisp.routeRequest(req, socket, head);
    else 
     socket.end();
});

server.on("listening", () => {
    console.log("Running")
});

server.listen(port);