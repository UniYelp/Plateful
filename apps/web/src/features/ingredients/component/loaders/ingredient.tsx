export const ingredientLoader = (
	<div className="flex min-h-screen items-center justify-center bg-background">
		<div className="space-y-6 text-center">
			{/* Animated cooking pot */}
			<div className="relative mx-auto h-24 w-24">
				<div className="absolute inset-0 animate-pulse rounded-b-full bg-slate-600"></div>
				<div className="-translate-x-1/2 absolute top-2 left-1/2 h-4 w-20 transform rounded-full bg-slate-700"></div>
				{/* Steam bubbles */}
				<div className="-top-2 -translate-x-1/2 absolute left-1/2 transform">
					<div
						className="h-2 w-2 animate-bounce rounded-full bg-primary/60"
						style={{ animationDelay: "0s" }}
					></div>
				</div>
				<div className="-top-4 -translate-x-1/2 -translate-x-2 absolute left-1/2 transform">
					<div
						className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary/40"
						style={{ animationDelay: "0.2s" }}
					></div>
				</div>
				<div className="-top-6 -translate-x-1/2 absolute left-1/2 translate-x-1 transform">
					<div
						className="h-1 w-1 animate-bounce rounded-full bg-primary/30"
						style={{ animationDelay: "0.4s" }}
					></div>
				</div>
			</div>

			{/* Loading text */}
			<div className="space-y-2">
				<h3 className="font-semibold text-foreground text-lg">
					Gathering fresh ingredients...
				</h3>
				<div className="flex items-center justify-center space-x-1">
					<div
						className="h-2 w-2 animate-bounce rounded-full bg-primary"
						style={{ animationDelay: "0s" }}
					></div>
					<div
						className="h-2 w-2 animate-bounce rounded-full bg-primary"
						style={{ animationDelay: "0.1s" }}
					></div>
					<div
						className="h-2 w-2 animate-bounce rounded-full bg-primary"
						style={{ animationDelay: "0.2s" }}
					></div>
				</div>
			</div>
		</div>
	</div>
);
