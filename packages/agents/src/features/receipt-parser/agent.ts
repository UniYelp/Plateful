import { generateObject } from "ai";
import { google } from "@ai-sdk/google";
import {
	type ReceiptExtractionOutput,
	ReceiptExtractionOutputSchema,
} from "./schemas";

export const ReceiptParserAgent = {
	parseReceipt: async (
		image: string | Buffer | URL,
	): Promise<ReceiptExtractionOutput> => {
		let imageData: Buffer | string;
		if (image instanceof URL) {
			imageData = image.href;
		} else if (Buffer.isBuffer(image)) {
			imageData = image.toString("base64");
		} else {
			imageData = image;
		}

		const { object } = await generateObject({
			model: google("gemini-2.5-flash"),
			schema: ReceiptExtractionOutputSchema,
			messages: [
				{
					role: "user",
					content: [
						{
							type: "text",
							text: "Extract all items from this receipt. Group identical items with the same name and description into a single entry with multiple quantities if applicable. Strictly categorize each item into one of the provided categories. If an item is not a food ingredient (e.g. batteries, soap, toilet paper), categorize it as 'non-edible'.",
						},
						{
							type: "image",
							image: imageData,
						},
					],
				},
			],
		});

		return object;
	},
};
