import type { StampedEntity } from "../schema";

const NotDeletedValue = undefined;

export const isSoftDeleted = <T extends Readonly<StampedEntity>>(
	entity: T,
): entity is T & Required<Pick<T, "deletedAt">> =>
	entity.deletedAt !== NotDeletedValue;

export const notDeletedIndex = [
	"deletedAt" satisfies keyof StampedEntity,
	NotDeletedValue,
] as const;
