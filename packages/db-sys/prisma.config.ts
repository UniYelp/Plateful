//! MUST APPEAR FIRST IN THE FILE | DO NOT MOVE
import "dotenv/config";

import { defineConfig, env } from "prisma/config";

type Env = {
	DATABASE_URL: string;
};

/**
 * @see {@link https://www.prisma.io/docs/orm/prisma-client/special-fields-and-types/working-with-json-fields#typed-json-fields}
 */
export default defineConfig({
	schema: "prisma/schema/schema.prisma",
	migrations: {
		path: "prisma/migrations",
		seed: "tsx prisma/seed.ts",
	},
	datasource: {
		url: env<Env>("DATABASE_URL"),
	},
});
