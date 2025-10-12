import tanstackQueryPlugin from "@tanstack/eslint-plugin-query";
import tanstackRouterPlugin from "@tanstack/eslint-plugin-router";
import { defineConfig, globalIgnores } from "eslint/config";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";

/**
 * @type {import("eslint").Linter.Config[]}
 */
// biome-ignore lint/style/noDefaultExport: external
export default defineConfig(
    globalIgnores(["dist"]),
    {
        files: ["**/*.{ts,tsx}"],
        languageOptions: {
            parser: tseslint.parser,
            parserOptions: {
                projectService: true,
            },
        }
    },
    {
        files: ["apps/web/**/*.{ts,tsx}"],
        plugins: {
            "@tanstack/query": tanstackQueryPlugin,
            "@tanstack/router": tanstackRouterPlugin,
        },
        extends: [
            reactHooks.configs.flat["recommended-latest"],
            reactRefresh.configs.vite,
        ],
        rules: {
            "@tanstack/query/exhaustive-deps": "error",
            "@tanstack/query/stable-query-client": "error",
            "@tanstack/router/create-route-property-order": "warn",
        },
    },
);
