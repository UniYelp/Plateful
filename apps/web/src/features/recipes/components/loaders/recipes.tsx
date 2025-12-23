export const recipesLoader = (
	<div className="space-y-6 text-center">
		{/* Animated recipe book */}
		<div className="relative mx-auto h-24 w-32">
			{/* Book base */}
			<div className="absolute inset-0 rounded-r-lg border-2 border-amber-200 bg-amber-100 shadow-lg"></div>
			<div className="absolute top-0 left-0 h-full w-1 rounded-l-lg bg-amber-300"></div>

			{/* Flipping pages */}
			<div className="absolute top-2 right-2 bottom-2 left-2 overflow-hidden">
				<div className="absolute inset-0 animate-pulse rounded border border-gray-200 bg-white"></div>
				<div
					className="absolute top-1 right-1 left-1 h-1 animate-pulse rounded bg-gray-300"
					style={{ animationDelay: "0.1s" }}
				></div>
				<div
					className="absolute top-3 right-4 left-1 h-1 animate-pulse rounded bg-gray-300"
					style={{ animationDelay: "0.2s" }}
				></div>
				<div
					className="absolute top-5 right-2 left-1 h-1 animate-pulse rounded bg-gray-300"
					style={{ animationDelay: "0.3s" }}
				></div>
			</div>

			{/* Chef's hat on top */}
			<div className="-top-4 -translate-x-1/2 absolute left-1/2 transform">
				<div className="h-6 w-8 animate-bounce rounded-t-full border-2 border-gray-200 bg-white"></div>
				<div className="-translate-x-1/2 absolute top-1 left-1/2 h-1 w-1 transform rounded-full bg-primary"></div>
			</div>
		</div>

		{/* Loading text */}
		<div className="space-y-2">
			<h3 className="font-semibold text-foreground text-lg">
				Flipping through recipes...
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
);
