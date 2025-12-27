import { treaty } from "@elysiajs/eden";

import type { App as ApiApp } from "@api/client";
import { ENV } from "./env.config";

export const apiClient = treaty<ApiApp>(ENV.API_URL);
