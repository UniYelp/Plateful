import tanstackQueryPlugin from "@tanstack/eslint-plugin-query";
import tanstackRouterPlugin from "@tanstack/eslint-plugin-router";
import { defineConfig } from "eslint/config";
import tseslint from "typescript-eslint";

/**
 * @type {import("eslint").Linter.Config[]}
 */
// biome-ignore lint/style/noDefaultExport: external config
export default defineConfig(tseslint.configs.recommended, {
    files: ["apps/web/**/*.{ts,tsx}"],
    plugins: {
        "@tanstack/query": tanstackQueryPlugin,
        "@tanstack/router": tanstackRouterPlugin,
    },
    rules: {
        "@tanstack/query/exhaustive-deps": "error",
        "@tanstack/query/stable-query-client": "error",
        "@tanstack/router/create-route-property-order": "warn",
    },
});
