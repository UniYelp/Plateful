import type { App } from "@barcode";
import { hc } from "hono/client";
import { ENV } from "./env.config";

export const barcodeServiceClient = hc<App>(ENV.VITE_BARCODE_SERVICE_URL);
