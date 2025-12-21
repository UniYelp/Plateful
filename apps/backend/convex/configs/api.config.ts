import { treaty } from "@elysiajs/eden";

import type { App as ApiServer } from "@api/client";

export const apiClient = treaty<ApiServer>(process.env.API_URL!);
