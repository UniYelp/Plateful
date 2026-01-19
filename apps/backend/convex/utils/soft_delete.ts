import type { TimeStampedEntity } from "../schema";

const NotDeletedValue = undefined;

export const isSoftDeleted = <T extends Readonly<TimeStampedEntity>>(
	entity: T,
): entity is T & Required<Pick<T, "deletedAt">> =>
	entity.deletedAt !== NotDeletedValue;

export const notDeletedIndex = [
	"deletedAt" satisfies keyof TimeStampedEntity,
	NotDeletedValue,
] as const;
