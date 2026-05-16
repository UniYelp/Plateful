import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Power } from "lucide-react";

import { configByStatus } from "&/ai/config.mapper";
import { localAiEnabledStorageKey } from "&/ai/constants";
import { aiStatusQueryOptions } from "&/ai/query";
import { AIStatus } from "&/ai/status.enum";
import { Progress } from "@/components/ui/progress";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";

export function AIStatusIndicator() {
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
					{data?.status === AIStatus.Loading && (
						<div className="space-y-1.5 pt-1">
							<Progress value={data.progress ?? 0} className="h-1" />
							<div className="flex justify-between font-medium text-[10px] text-muted-foreground uppercase tabular-nums tracking-wider">
								<span>Downloading Model</span>
								<span>{data.progress ?? 0}%</span>
							</div>
						</div>
					)}
				</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	);
}
