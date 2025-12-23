//! DO NOT IMPORT ANYTHING HERE OTHER THAN GENERATED TYPES

export const SYSTEM_ID = "sys";
export type SystemId = typeof SYSTEM_ID;

export const REMAINING_QUANTITY = "remaining";
export type RemainingQuantity = typeof REMAINING_QUANTITY;

export const ALL_QUANTITY = "all";
export type AllQuantity = typeof ALL_QUANTITY;

export const memberRoles = ["manager", "member"] as const;
export type MemberRole = (typeof memberRoles)[number];
