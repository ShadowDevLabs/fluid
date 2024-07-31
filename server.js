import { resolve, dirname } from "node:path";
import { readFileSync, cpSync, writeFileSync, copyFileSync, existsSync, mkdirSync, rmSync, readdirSync } from "node:fs";
import { createServer } from "node:http";
import { fileURLToPath } from "node:url";
import express from "express";
import { server as wisp, logging } from "@mercuryworkshop/wisp-js/server";
import { baremuxPath } from "@mercuryworkshop/bare-mux/node";
import { libcurlPath } from "@mercuryworkshop/libcurl-transport";
import { epoxyPath } from "@mercuryworkshop/epoxy-transport";
import { uvPath } from "@titaniumnetwork-dev/ultraviolet";
import { scramjetPath } from "@mercuryworkshop/scramjet";

const server = createServer();