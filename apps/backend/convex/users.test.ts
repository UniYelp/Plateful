import { convexTest } from "convex-test";
import { expect, test } from "vitest";
import { api } from "./_generated/api";
import schema from "./schema";
import { modules } from "./test.setup";

test("current user should be null when not signed in", async () => {
	const t = convexTest(schema, modules);
	const user = await t.query(api.users.current);
	expect(user).toBeNull();
});
