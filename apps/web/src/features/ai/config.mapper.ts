import { AIStatus } from "./status.enum";

export const configByStatus = {
	[AIStatus.Ready]: {
		colorClass: "text-indigo-600 dark:text-indigo-400",
		dotClass: "bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.8)]",
		title: "Local Device AI: Ready",
		description:
			"Powers fast on-device features. Completely separate from cloud AI like Recipe Gen or Receipt Scanner.",
	},
	[AIStatus.Loading]: {
		colorClass: "text-amber-600 dark:text-amber-400",
		dotClass:
			"bg-amber-500 animate-pulse shadow-[0_0_8px_rgba(245,158,11,0.8)]",
		title: "Local Device AI: Powering Up...",
		description:
			"Initializing on-device models. Completely separate from cloud AI.",
	},
	[AIStatus.Error]: {
		colorClass: "text-destructive opacity-80",
		dotClass: "bg-destructive",
		title: "Local Device AI: Error",
		description:
			"On-device models encountered an issue. Cloud AI features are unaffected and still work.",
	},
	[AIStatus.None]: {
		colorClass: "text-muted-foreground opacity-50",
		dotClass: "bg-muted-foreground/50",
		title: "Local Device AI: Unavailable",
		description:
			"Your browser doesn't support on-device AI. Cloud AI features (Recipe Gen, Receipt Scanner) are unaffected and still work.",
	},
	[AIStatus.Disabled]: {
		colorClass: "text-muted-foreground",
		dotClass: "bg-muted-foreground",
		title: "Local Device AI: Disabled",
		description:
			"On-device AI is currently disabled. Click to enable it and power on-device features.",
	},
} satisfies Record<
	AIStatus,
	{
		colorClass: string;
		dotClass: string;
		title: string;
		description: string;
	}
>;
