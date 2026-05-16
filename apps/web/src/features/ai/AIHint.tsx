import { Sparkles } from "lucide-react";

import { cn } from "@/utils/ui";

type Props = {
	hint: string;
	title?: string;
	onClick: VoidFunction;
	className?: string;
};

export function AIHint({ hint, title, onClick, className }: Props) {
	return (
		<button
			type="button"
			title={title}
			onClick={onClick}
			className={cn(
				"flex items-center gap-1.5 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-2.5 py-1 font-medium text-indigo-600 text-xs shadow-sm backdrop-blur-sm transition-all hover:bg-indigo-500/20 dark:bg-indigo-400/10 dark:text-indigo-400 dark:hover:bg-indigo-400/20",
				className,
			)}
		>
			<Sparkles className="h-3 w-3" />
			<span className="block truncate">{hint}</span>
		</button>
	);
}

AIHint.Loading = function AIHintLoading({ className }: { className?: string }) {
	return (
		<div
			className={cn(
				"flex animate-pulse items-center gap-1.5 rounded-full border border-indigo-500/10 bg-indigo-500/5 px-2.5 py-1 font-medium text-indigo-400/50 text-xs shadow-sm backdrop-blur-sm",
				className,
			)}
		>
			<Sparkles className="h-3 w-3" />
			<span className="h-3 w-full rounded bg-indigo-400/20"></span>
		</div>
	);
};
