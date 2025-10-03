import { hc } from "hono/client";
import type { app } from "../app.js";

/**
 * {@link https://hono.dev/docs/guides/rpc#typescript-project-references}
 */

// this is a trick to calculate the type when compiling
export type Client = ReturnType<typeof hc<typeof app>>;

export const client = (...args: Parameters<typeof hc>): Client =>
	hc<typeof app>(...args);
