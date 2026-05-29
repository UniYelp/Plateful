import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Power } from "lucide-react";

import { configByStatus } from "&/ai/config.mapper";
import { localAiEnabledStorageKey } from "&/ai/constants";
import { aiStatusQueryOptions } from "&/ai/query";
import { AIStatus } from "&/ai/status.enum";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";

interface AIStatusIndicatorProps {
	variant?: "desktop" | "mobile";
}

export function AIStatusIndicator({
	variant = "desktop",
}: AIStatusIndicatorProps) {
	const queryClient = useQueryClient();

	const { data, isLoading } = useQuery(aiStatusQueryOptions);

	const status = isLoading ? AIStatus.Loading : data?.status || AIStatus.None;

	const statusConfig = configByStatus[status];

	const handleToggle = async () => {
		const isCurrentlyEnabled =
			localStorage.getItem(localAiEnabledStorageKey) === "true";

		const next = !isCurrentlyEnabled;

		if (!next && data?.session) {
			data.session.destroy();
		}

		localStorage.setItem(localAiEnabledStorageKey, next.toString());

		queryClient.resetQueries({ queryKey: aiStatusQueryOptions.queryKey });
	};

	if (variant === "mobile") {
		return (
			<button
				type="button"
				onClick={handleToggle}
				className="flex w-full cursor-pointer items-center justify-between rounded-lg p-2 text-left transition-colors hover:bg-muted/80"
			>
				<div className="flex flex-col gap-0.5">
					<span className="flex items-center gap-2 font-medium text-sm">
						<Power className={`h-4 w-4 ${statusConfig.colorClass}`} />
						Local AI Model
					</span>
					<span className="text-muted-foreground text-xs">
						{statusConfig.title}: {statusConfig.description}
					</span>
				</div>
				<span
					className={`h-2.5 w-2.5 rounded-full border border-background ${statusConfig.dotClass}`}
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
						className="relative hidden cursor-pointer items-center justify-center rounded-full p-2 transition-colors hover:bg-muted/80 md:flex"
						aria-label="Toggle Local AI"
					>
						<Power className={`h-[18px] w-[18px] ${statusConfig.colorClass}`} />
						<span
							className={`absolute right-1.5 bottom-1.5 h-2 w-2 rounded-full border border-background ${statusConfig.dotClass}`}
						/>
					</button>
				</TooltipTrigger>
				<TooltipContent
					className="max-w-xs space-y-1"
					side="bottom"
					align="end"
				>
					<p className="font-semibold text-sm">{statusConfig.title}</p>
					<p className="text-muted-foreground text-xs">
						{statusConfig.description}
					</p>
					{/* {status === AIStatus.Loading && (
						<div className="space-y-1.5 pt-1">
							<Progress value={progress ?? 0} className="h-1" />
							<div className="flex justify-between font-medium text-[10px] text-muted-foreground uppercase tabular-nums tracking-wider">
								<span>Downloading Model</span>
								<span>{progress ? Math.round(progress) : "0"}%</span>
							</div>
						</div>
					)} */}
				</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	);
}
