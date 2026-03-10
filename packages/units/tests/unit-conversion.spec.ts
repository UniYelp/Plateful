import { describe, expect, it } from "vitest";

import { unitConversion } from "../src/utils/unit-conversion";

// Simple custom units setup for testing
type LengthUnit = "m" | "cm" | "mm" | "km" | "in" | "ft";
type LengthConversion = { from: LengthUnit; to: LengthUnit; ratio: number };

const lengthUnits: LengthUnit[] = ["m", "cm", "mm", "km", "in", "ft"];

const lengthConversions: LengthConversion[] = [
	{ from: "m", to: "cm", ratio: 100 },
	{ from: "cm", to: "mm", ratio: 10 },
	{ from: "km", to: "m", ratio: 1000 },
	{ from: "in", to: "cm", ratio: 2.54 },
	{ from: "ft", to: "in", ratio: 12 },
];

const { convertUnits, getConversions } = unitConversion({
	units: lengthUnits,
	conversions: lengthConversions,
	getConversion: (c) => c.ratio,
	getReverseConversion: (c) => 1 / c.ratio,
	cost: () => 1, // unit cost per step to allow dijkstra to prefer shortest paths
	calculate: (res, initialValue: number = 1) => {
		let val = initialValue;
		for (const ratio of res.conversions) {
			val *= ratio;
		}
		return val;
	},
});

describe("unitConversion utility", () => {
	it("converts direct forward correctly", () => {
		expect(convertUnits("m", "cm", 1)).toBe(100);
		expect(convertUnits("m", "cm", 5)).toBe(500);
	});

	it("converts direct reverse correctly", () => {
		expect(convertUnits("cm", "m", 100)).toBe(1);
	});

	it("converts transitively forward and backward", () => {
		expect(convertUnits("m", "mm", 1)).toBe(1000); // m -> cm -> mm
		expect(convertUnits("km", "mm", 1)).toBe(1_000_000);
		expect(convertUnits("mm", "km", 1_000_000)).toBe(1);
	});

	it("converts complex paths", () => {
		// ft -> in -> cm -> m
		const ftToM = convertUnits("ft", "m", 1);
		expect(ftToM).toBeCloseTo(0.3048);
	});

	it("returns null if no path exists", () => {
		const { convertUnits: disjointConvert } = unitConversion({
			units: ["a", "b", "c"],
			conversions: [{ from: "a", to: "b", ratio: 2 }],
			getConversion: (c) => c.ratio,
			getReverseConversion: (c) => 1 / c.ratio,
			cost: () => 1,
			calculate: (res, initialValue: number = 1) =>
				initialValue * (res.conversions[0] ?? 1),
		});

		expect(disjointConvert("a", "c", 0)).toBeNull();
	});

	it("returns connected components via getConversions", () => {
		const connectedToM = getConversions("m");
		const allSet = new Set(["m", "cm", "mm", "km", "in", "ft"]);
		expect(new Set(connectedToM)).toEqual(allSet);

		const { getConversions: disjointGet } = unitConversion({
			units: ["a", "b", "c"],
			conversions: [{ from: "a", to: "b", ratio: 2 }],
			getConversion: (c) => c.ratio,
			getReverseConversion: (c) => 1 / c.ratio,
			cost: () => 1,
			calculate: () => 1,
		});

		expect(new Set(disjointGet("a"))).toEqual(new Set(["a", "b"]));
		expect(new Set(disjointGet("c"))).toEqual(new Set(["c"]));
	});
});
