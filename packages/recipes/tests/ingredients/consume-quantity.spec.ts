import { describe, expect, it } from "vitest";

import { IngredientUnit } from "@plateful/ingredients";
import { SCALAR_UNIT } from "../../src/constants";
import { QuantityExceededError } from "../../src/models";
import { consumeQuantity } from "../../src/utils/ingredients/consume-quantity";

describe("consumeQuantity", () => {
	it("should consume from a single unit when exactly available", () => {
		const available = new Map<IngredientUnit | typeof SCALAR_UNIT, number>([
			[IngredientUnit.Gram, 100],
		]);
		const consume = { value: 100, unit: IngredientUnit.Gram };
		const result = consumeQuantity({ available, consume });

		expect(result).toBeInstanceOf(Map);
		if (result instanceof Map) {
			expect(result.get(IngredientUnit.Gram)).toBe(0);
		}
	});

	it("should consume from multiple units (partial consumption)", () => {
		const available = new Map<IngredientUnit | typeof SCALAR_UNIT, number>([
			[IngredientUnit.Gram, 100],
			[IngredientUnit.Kilogram, 1],
		]);
		const consume = { value: 500, unit: IngredientUnit.Gram };
		const result = consumeQuantity({ available, consume });

		expect(result).toBeInstanceOf(Map);
		if (result instanceof Map) {
			// It should consume 100g, then 400g from 1kg
			// 1kg - 400g = 600g = 0.6kg
			expect(result.get(IngredientUnit.Gram)).toBe(0);
			expect(result.get(IngredientUnit.Kilogram)).toBeCloseTo(0.6);
		}
	});

	it("should consume with unit conversion (kg to g)", () => {
		const available = new Map<IngredientUnit | typeof SCALAR_UNIT, number>([
			[IngredientUnit.Kilogram, 1],
		]);
		const consume = { value: 500, unit: IngredientUnit.Gram };
		const result = consumeQuantity({ available, consume });

		expect(result).toBeInstanceOf(Map);
		if (result instanceof Map) {
			expect(result.get(IngredientUnit.Kilogram)).toBeCloseTo(0.5);
		}
	});

	it("should return QuantityExceededError when not enough available", () => {
		const available = new Map<IngredientUnit | typeof SCALAR_UNIT, number>([
			[IngredientUnit.Gram, 100],
		]);
		const consume = { value: 200, unit: IngredientUnit.Gram };
		const result = consumeQuantity({ available, consume });

		expect(result).toBeInstanceOf(QuantityExceededError);
	});

	it("should handle SCALAR_UNIT", () => {
		const available = new Map<IngredientUnit | typeof SCALAR_UNIT, number>([
			[SCALAR_UNIT, 10],
		]);
		const consume = { value: 5 }; // no unit means SCALAR_UNIT
		const result = consumeQuantity({ available, consume });

		expect(result).toBeInstanceOf(Map);
		if (result instanceof Map) {
			expect(result.get(SCALAR_UNIT)).toBe(5);
		}
	});

	it("should return available map when consume value is zero", () => {
		const available = new Map<IngredientUnit | typeof SCALAR_UNIT, number>([
			[IngredientUnit.Gram, 100],
		]);
		const consume = { value: 0, unit: IngredientUnit.Gram };
		const result = consumeQuantity({ available, consume });

		expect(result).toEqual(available);
	});

	it("should handle multiple units of the same type (actually Map doesn't allow that, but different convertible units)", () => {
		const available = new Map<IngredientUnit | typeof SCALAR_UNIT, number>([
			[IngredientUnit.Gram, 500],
			[IngredientUnit.Kilogram, 0.5],
		]);
		const consume = { value: 750, unit: IngredientUnit.Gram };
		const result = consumeQuantity({ available, consume });

		expect(result).toBeInstanceOf(Map);
		if (result instanceof Map) {
			// If Gram is picked first (it's first in the Map)
			// Gram: 500 - 500 = 0
			// Kilogram: 0.5 - 250g(0.25kg) = 0.25kg
			expect(result.get(IngredientUnit.Gram)).toBe(0);
			expect(result.get(IngredientUnit.Kilogram)).toBeCloseTo(0.25);
		}
	});
});
