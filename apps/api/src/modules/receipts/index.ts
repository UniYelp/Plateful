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
			const buffer = await image.arrayBuffer();
			const base64 = Buffer.from(buffer).toString("base64");
			const dataUrl = `data:${image.type};base64,${base64}`;

			const result = await ReceiptService.parseReceipt(dataUrl);
			return result;
		},
		{
			body: ReceiptsModel.parseReceiptBody,
			response: ReceiptsModel.parseReceiptResponse,
		},
	);
