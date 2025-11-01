import { describe, expect, test } from "vitest";

import { app } from "../src/app.js";

describe("index route", () => {
	test("GET /", async () => {
		const res = await app.request("/");
		expect.soft(res.status).toBe(200);
		expect(await res.text()).toBe("Welcome to @plateful/api-gateway");
	});
});
