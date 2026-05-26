import { convexTest } from "convex-test";
import { describe, expect, it } from "vitest";

import { IngredientUnit } from "@plateful/ingredients";
import { api } from "./_generated/api";
import schema from "./schema";
import { modules } from "./test.setup";

describe("ingredients:mergeQuantities", () => {
	it("should merge quantities with the same unit and expiry date, keeping different expiry dates separate", async () => {
		const t = convexTest(schema, modules);

		// 1. Create a user
		const userId = await t.run(async (ctx) => {
			return await ctx.db.insert("users", {
				externalId: "user_123",
				updatedAt: Date.now(),
			});
		});

		// Authenticate test client as this user
		const asAuthUser = t.withIdentity({ subject: "user_123" });

		// 2. Create household and membership
		const householdId = await asAuthUser.run(async (ctx) => {
			const householdId = await ctx.db.insert("households", {
				name: "Test Household",
				createdBy: userId,
				updatedBy: userId,
				updatedAt: Date.now(),
			});
			await ctx.db.insert("householdMembers", {
				householdId,
				userId,
				role: "manager",
				joinedAt: Date.now(),
				createdBy: userId,
				updatedBy: userId,
				updatedAt: Date.now(),
			});
			return householdId;
		});

		// 3. Insert an ingredient with some unmerged quantities
		const ingredientId = await asAuthUser.run(async (ctx) => {
			return await ctx.db.insert("ingredients", {
				householdId,
				name: "Salt",
				category: "Pantry",
				tags: [],
				createdBy: userId,
				updatedBy: userId,
				updatedAt: Date.now(),
				images: [],
				quantities: [
					{ amount: 100, unit: IngredientUnit.Gram, expiresAt: 1000 },
					{ amount: 50, unit: IngredientUnit.Gram, expiresAt: 1000 },
					{ amount: 1, unit: IngredientUnit.Kilogram, expiresAt: 2000 },
					{ amount: 200, unit: IngredientUnit.Gram, expiresAt: 2000 },
					{
						amount: 100,
						unit: IngredientUnit.Milliliter,
						expiresAt: undefined,
					},
					{ amount: 5, expiresAt: undefined },
					{ amount: 2, expiresAt: undefined },
				],
			});
		});

		// 4. Run the merge mutation
		await asAuthUser.mutation(api.ingredients.mergeQuantities, {
			householdId,
			ingredientId,
		});

		// 5. Fetch the updated ingredient and verify quantities
		const updatedIngredient = await asAuthUser.run(async (ctx) => {
			const ing = await ctx.db.get("ingredients", ingredientId);
			if (!ing) throw new Error("Ingredient not found");
			return ing;
		});

		// Sort quantities by expiresAt to make assertion order independent
		const mergedQuantities = [...updatedIngredient.quantities].sort((a, b) => {
			if (a.expiresAt === undefined) return 1;
			if (b.expiresAt === undefined) return -1;
			return a.expiresAt - b.expiresAt;
		});

		expect(mergedQuantities).toEqual([
			{ amount: 150, unit: IngredientUnit.Gram, expiresAt: 1000 },
			{ amount: 1, unit: IngredientUnit.Kilogram, expiresAt: 2000 },
			{ amount: 200, unit: IngredientUnit.Gram, expiresAt: 2000 },
			{ amount: 100, unit: IngredientUnit.Milliliter },
			{ amount: 7 },
		]);
	});
});
