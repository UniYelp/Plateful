import { NanoBanana } from "convex-nano-banana";

import { components } from "../_generated/api";
import { ENV } from "./env.config";

export const nanoBanana = new NanoBanana(components.nanoBanana, {
	GEMINI_API_KEY: ENV.GEMINI_API_KEY,
});
