import { ReceiptParserAgent } from "@plateful/agents/receipt-parser";

export const parseReceipt = async (
	image: string,
	keepOriginalLanguage?: boolean,
) => {
	const result = await ReceiptParserAgent.parseReceipt(image, {
		keepOriginalLanguage,
	});
	return result;
};
