import { Hono } from "hono";

import packageJson from "../package.json" with { type: "json" };

const app = new Hono().get("/", (c) => c.text(packageJson.name));

export default app;
