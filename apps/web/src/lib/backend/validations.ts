import type { GenericId } from "convex/values";
import z from "zod";

import type { TableNames } from "@backend/dataModel";

const _zidRegistry = z.registry<{ tableName: string }>();

export type Zid<TableName extends TableNames> = z.ZodCustom<
	GenericId<TableName>
>;

/**
 * ! COPIED FROM `convex-helpers/server/zod`
 *
 * Creates a validator for a Convex `Id`.
 *
 * - When **used within Zod**, it will only check that the ID is a string.
 * - When **converted to a Convex validator** (e.g. through {@link zodToConvex}),
 *   it will check that it's for the right table.
 *
 * @param tableName - The table that the `Id` references. i.e. `Id<tableName>`
 * @returns A Zod schema representing a Convex `Id`
 */
export const zid = <const TableName extends TableNames>(
	tableName: TableName,
): Zid<TableName> => {
	const result = z.custom<GenericId<TableName>>(
		(val) => typeof val === "string",
	);
	_zidRegistry.add(result, { tableName });
	return result;
};
