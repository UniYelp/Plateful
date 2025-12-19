import { treaty } from "@elysiajs/eden";

import type { App as ApiServer } from "@api/client";
import { ENV } from "./env.config";

export const apiClient = treaty<ApiServer>(ENV.VITE_API_URL);
