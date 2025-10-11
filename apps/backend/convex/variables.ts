import type { GenericSchema } from "convex/server";
import {
	type GenericId,
	// biome-ignore lint/style/noRestrictedImports: overriding this
	v as rawV,
	type VId,
} from "convex/values";

import type { StrictOmit } from "@plateful/types";
import type Schema from "./schema";

type TableNames<Schema extends GenericSchema> = (keyof Schema | "_storage") &
	string;

type V<Schema extends GenericSchema> = StrictOmit<typeof rawV, "id"> & {
	id: <TableName extends NoInfer<TableNames<Schema>>>(
		tableName: TableName,
	) => VId<GenericId<TableName>>;
};

export const v: V<typeof Schema.tables> = rawV;
