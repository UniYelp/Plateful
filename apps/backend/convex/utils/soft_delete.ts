import type { StampedEntity } from "../schema";

const EntityNotDeletedValue = undefined;

export const isSoftDeleted = (entity: Readonly<StampedEntity>) =>
	entity.deletedAt !== EntityNotDeletedValue;

export const notDeletedIndex = [
	"deletedAt" satisfies keyof StampedEntity,
	EntityNotDeletedValue,
] as const;
