import { Bell, BellOff } from "lucide-react";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";

interface NotificationStatusProps {
	variant?: "desktop" | "mobile";
}

export function NotificationStatus({
	variant = "desktop",
}: NotificationStatusProps) {
	const {
		isSupported,
		permission,
		isSubscribed,
		isLoading,
		subscribe,
		unsubscribe,
	} = usePushNotifications();

	const handleToggle = async () => {
		if (isLoading || !isSupported) return;
		try {
			if (isSubscribed) {
				await unsubscribe();
			} else {
				await subscribe();
			}
		} catch (e) {
			console.error("Toggle push notifications failed:", e);
		}
	};

	if (!isSupported) {
		if (variant === "mobile") {
			return (
				<div className="flex w-full items-center justify-between rounded-lg p-2 opacity-50">
					<div className="flex flex-col gap-0.5">
						<span className="text-sm font-medium flex items-center gap-2">
							<BellOff className="h-4 w-4 text-muted-foreground" />
							Push Notifications
						</span>
						<span className="text-xs text-muted-foreground">
							Not supported on this browser
						</span>
					</div>
					<span className="h-2.5 w-2.5 rounded-full bg-neutral-400" />
				</div>
			);
		}
		return null; // Don't show on desktop if not supported
	}

	let statusTitle = "Notifications Disabled";
	let statusDesc =
		"Click to enable push notifications for recipe gen and food expiration.";
	let colorClass = "text-muted-foreground";
	let dotClass = "bg-neutral-400";
	let Icon = Bell;

	if (isSubscribed && permission === "granted") {
		statusTitle = "Notifications Active";
		statusDesc =
			"You will receive alerts when recipe gen finishes or ingredients expire.";
		colorClass = "text-emerald-500";
		dotClass = "bg-emerald-500";
	} else if (permission === "denied") {
		statusTitle = "Notifications Blocked";
		statusDesc =
			"Permission was denied. Please allow notifications in your browser settings.";
		colorClass = "text-destructive";
		dotClass = "bg-destructive";
		Icon = BellOff;
	}

	if (variant === "mobile") {
		return (
			<button
				type="button"
				onClick={handleToggle}
				disabled={permission === "denied"}
				className={`flex w-full items-center justify-between rounded-lg p-2 hover:bg-muted/80 text-left transition-colors ${
					permission === "denied"
						? "cursor-not-allowed opacity-80"
						: "cursor-pointer"
				}`}
			>
				<div className="flex flex-col gap-0.5">
					<span className="text-sm font-medium flex items-center gap-2">
						<Icon className={`h-4 w-4 ${colorClass}`} />
						Push Notifications
					</span>
					<span className="text-xs text-muted-foreground">{statusDesc}</span>
				</div>
				<span
					className={`h-2.5 w-2.5 rounded-full border border-background ${dotClass}`}
				/>
			</button>
		);
	}

	return (
		<TooltipProvider delayDuration={100}>
			<Tooltip>
				<TooltipTrigger asChild>
					<button
						type="button"
						onClick={handleToggle}
						disabled={permission === "denied"}
						className={`relative hidden items-center justify-center rounded-full p-2 transition-colors hover:bg-muted/80 md:flex ${
							permission === "denied" ? "cursor-not-allowed" : "cursor-pointer"
						}`}
						aria-label="Toggle Push Notifications"
					>
						<Icon className={`h-[18px] w-[18px] ${colorClass}`} />
						<span
							className={`absolute right-1.5 bottom-1.5 h-2 w-2 rounded-full border border-background ${dotClass}`}
						/>
					</button>
				</TooltipTrigger>
				<TooltipContent className="max-w-xs space-y-1" side="bottom" align="end">
					<p className="font-semibold text-sm">{statusTitle}</p>
					<p className="text-muted-foreground text-xs">{statusDesc}</p>
				</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	);
}
