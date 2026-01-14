import type { StampedEntity } from "../schema";

const EntityNotDeletedValue = undefined;

export const isSoftDeleted = <T extends Readonly<StampedEntity>>(
	entity: T,
): entity is T & Required<Pick<T, "deletedAt">> =>
	entity.deletedAt !== EntityNotDeletedValue;

export const notDeletedIndex = [
	"deletedAt" satisfies keyof StampedEntity,
	EntityNotDeletedValue,
] as const;
