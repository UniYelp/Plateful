import { client } from "@plateful/barcode-service";
import { ENV } from "./env.config";

export const barcodeServiceClient = client(ENV.VITE_BARCODE_SERVICE_URL);
