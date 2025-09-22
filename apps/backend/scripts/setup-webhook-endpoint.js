#!/usr/bin/env node

// @ts-check

import { execSync } from "node:child_process";

const ngrokUrl = process.env.NGROK_URL;
const CONVEX_URL = process.env.CONVEX_URL || 6790;

if (!ngrokUrl) {
    console.log("You must set a value to the `NGROK_URL` env var");
}

// Run a subprocess with the env var
execSync(`ngrok http --url=${ngrokUrl} ${CONVEX_URL}`, {
    stdio: "inherit"
});
