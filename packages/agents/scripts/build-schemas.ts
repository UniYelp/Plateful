import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import z from "zod";

import {
	RecipeGenInputSchema,
	RecipeGenOutputSchema,
	RecipeGenResultSchema,
} from "../src/features/recipes";
import { SafetyInputSchema, SafetyOutputSchema } from "../src/features/safety";

type SchemaRecord = Record<string, z.ZodType>;

const schemas: SchemaRecord = {
	RecipeGenOutputSchema,
	RecipeGenInputSchema,
	RecipeGenResultSchema,
	SafetyOutputSchema,
	SafetyInputSchema,
};

async function dumpJsonSchemas(
	schemas: SchemaRecord,
	outputDir = "json-schemas",
) {
	await mkdir(outputDir, { recursive: true });

	await Promise.all(
		Object.entries(schemas).map(async ([name, schema]) => {
			const jsonSchema = z.toJSONSchema(schema);

			const filePath = join(outputDir, `${name}.json`);

			await writeFile(filePath, JSON.stringify(jsonSchema, null, 2), "utf8");
		}),
	);
}

await dumpJsonSchemas(schemas);
