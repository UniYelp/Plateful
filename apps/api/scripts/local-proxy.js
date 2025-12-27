#!/usr/bin/env node

// @ts-check

import { execSync } from "node:child_process";

import { appConfig } from "../src/configs/app.config.ts";

/**
 * {@link https://clerk.com/docs/guides/development/webhooks/syncing#set-up-ngrok}
 */
const ngrokUrl = process.env.NGROK_URL;

const {
	dev: { port },
} = appConfig;

if (!ngrokUrl) {
	console.error("You must set a value to the `NGROK_URL` env var");
}

// Run a subprocess with the env var
execSync(`ngrok http --url=${ngrokUrl} ${port}`, {
	stdio: "inherit",
});
