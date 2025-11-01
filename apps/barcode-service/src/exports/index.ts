import type { ExtractHonoSchema } from "../extract-hono-schema.type.js";
import type { barcodeRoute } from "../routes/api/barcode.route.js";

export type BarcodeServiceApiSchema = ExtractHonoSchema<typeof barcodeRoute>;
