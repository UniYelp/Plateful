import { ReceiptParserAgent } from "@plateful/agents/receipt-parser";

export const parseReceipt = async (image: string) => {
	const result = await ReceiptParserAgent.parseReceipt(image);
	return result;
};
