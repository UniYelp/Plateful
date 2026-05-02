import { generateObject } from "ai";
import { google } from "@ai-sdk/google";
import {
	type ReceiptExtractionOutput,
	ReceiptExtractionOutputSchema,
} from "./schemas";

export const ReceiptParserAgent = {
	parseReceipt: async (
		image: string | Buffer | URL,
		options: { keepOriginalLanguage?: boolean } = {},
	): Promise<ReceiptExtractionOutput> => {
		const keepOriginalLanguage =
			options.keepOriginalLanguage === true ||
			options.keepOriginalLanguage === undefined ||
			String(options.keepOriginalLanguage) === "true";
		let imageData: Buffer | string;
		if (image instanceof URL) {
			imageData = image.href;
		} else if (Buffer.isBuffer(image)) {
			imageData = image.toString("base64");
		} else {
			imageData = image;
		}

		const translationInstruction = keepOriginalLanguage
			? " You MUST keep the original language of the items as they appear on the receipt."
			: " IMPORTANT: All extracted item names and descriptions MUST be translated to English. Even if the receipt is in another language (like Hebrew), you must provide the output in English.";

		const { object } = await generateObject({
			model: google("gemini-2.5-flash"),
			schema: ReceiptExtractionOutputSchema,
			messages: [
				{
					role: "user",
					content: [
						{
							type: "text",
							text: `Extract all items from this receipt.${translationInstruction} Group identical items with the same name and description into a single entry with multiple quantities if applicable. Strictly categorize each item into one of the provided categories. If an item is not a food ingredient (e.g. batteries, soap, toilet paper), categorize it as 'non-edible'.`,
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
