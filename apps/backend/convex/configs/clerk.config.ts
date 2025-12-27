import { createClerkClient } from "@clerk/backend";

import { ENV } from "./env.config";

export const clerk = createClerkClient({
	secretKey: ENV.CLERK_SECRET_KEY,
});
