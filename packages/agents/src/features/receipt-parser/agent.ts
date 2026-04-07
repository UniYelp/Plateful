import type { ReceiptExtractionOutput } from "./schemas";

export const ReceiptParserAgent = {
	parseReceipt: async (
		_image: string | Buffer | URL,
	): Promise<ReceiptExtractionOutput> => {
		// This is a stub for now as requested.
		// It returns a predefined list of ingredients regardless of the image content.
		return {
			ingredients: [
				{
					name: "Milk",
					amount: 1,
					unit: "liter",
					description: "Whole milk",
					category: "dairy",
				},
				{
					name: "Eggs",
					amount: 500,
					unit: "gram",
					description: "Large brown eggs",
					category: "dairy",
				},
				{
					name: "Sourdough Bread",
					amount: 1,
					unit: "slice",
					description: "Freshly baked sourdough",
					category: "grains",
				},
			],
		};
	},
};
