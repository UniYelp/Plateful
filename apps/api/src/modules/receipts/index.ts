import { Elysia } from "elysia";
import { auth } from "../../plugins/auth.plugin";
import { logger } from "../../plugins/logger.plugin";
import { ReceiptsModel } from "./model";
import * as ReceiptService from "./service";

export const receipts = new Elysia({
	prefix: "receipts",
})
	.use(logger())
	.use(auth())
	.post(
		"parse",
		async ({ body: { image } }) => {
			const result = await ReceiptService.parseReceipt(image);
			return result;
		},
		{
			body: ReceiptsModel.parseReceiptBody,
			response: ReceiptsModel.parseReceiptResponse,
		},
	);
