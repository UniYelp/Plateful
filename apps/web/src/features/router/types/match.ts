import type { useMatches } from "@tanstack/react-router";

export type Match = ReturnType<typeof useMatches>[number];
