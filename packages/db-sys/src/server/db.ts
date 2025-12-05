import { PrismaPg } from "@prisma/adapter-pg";

// biome-ignore lint/style/noRestrictedImports: server-land is allowed
import { PrismaClient } from "../__generated__/prisma/client";

export const createDatabaseClient = (connectionString: string) => {
	const adapter = new PrismaPg({ connectionString });
	const prisma = new PrismaClient({ adapter });

	return prisma;
};
