import { describe, expect, it } from "vitest";
import { ReceiptParserAgent } from "../src/features/receipt-parser";

describe("ReceiptParserAgent", () => {
	it("should return the stubbed ingredients", async () => {
		const result = await ReceiptParserAgent.parseReceipt("dummy-image");
		
		expect(result.ingredients).toHaveLength(3);
		expect(result.ingredients[0].name).toBe("Milk");
		expect(result.ingredients[1].name).toBe("Eggs");
		expect(result.ingredients[2].name).toBe("Sourdough Bread");
		
		for (const ing of result.ingredients) {
			expect(ing).toHaveProperty("amount");
			expect(ing).toHaveProperty("unit");
			expect(ing).toHaveProperty("description");
			expect(ing).toHaveProperty("category");
		}
	});
});
