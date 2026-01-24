import { ChefHat, Heart, Home, Utensils } from "lucide-react";

export function HouseholdLoading() {
	return (
		<div className="flex min-h-screen items-center justify-center bg-linear-to-b from-background to-primary/5">
			<div className="space-y-8 text-center">
				{/* Main animation container */}
				<div className="relative mx-auto h-48 w-48">
					{/* Outer rotating ring */}
					<div
						className="absolute inset-0 rounded-full border-4 border-primary/20 border-dashed"
						style={{
							animation: "spin 12s linear infinite",
						}}
					/>

					{/* Inner pulsing circle */}
					<div className="absolute inset-4 animate-pulse rounded-full bg-linear-to-br from-primary/10 to-orange-100/50" />

					{/* Center house icon */}
					<div className="absolute inset-0 flex items-center justify-center">
						<div className="relative">
							<div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-linear-to-br from-primary to-primary/80 shadow-lg">
								<Home className="h-10 w-10 text-white" />
							</div>
							{/* Glow effect */}
							<div className="-z-10 absolute inset-0 rounded-2xl bg-primary/30 blur-xl" />
						</div>
					</div>

					{/* Orbiting icons */}
					<div
						className="absolute inset-0"
						style={{ animation: "spin 4s linear infinite" }}
					>
						<div className="-translate-x-1/2 -translate-y-1/2 absolute top-0 left-1/2">
							<div className="flex h-10 w-10 items-center justify-center rounded-full border border-primary/10 bg-white shadow-md">
								<ChefHat className="h-5 w-5 text-primary" />
							</div>
						</div>
					</div>

					<div
						className="absolute inset-0"
						style={{
							animation: "spin 4s linear infinite reverse",
							animationDelay: "-1s",
						}}
					>
						<div className="-translate-x-1/2 absolute bottom-0 left-1/2 translate-y-1/2">
							<div className="flex h-10 w-10 items-center justify-center rounded-full border border-primary/10 bg-white shadow-md">
								<Utensils className="h-5 w-5 text-primary" />
							</div>
						</div>
					</div>

					<div
						className="absolute inset-0"
						style={{
							animation: "spin 6s linear infinite",
							animationDelay: "-2s",
						}}
					>
						<div className="-translate-y-1/2 absolute top-1/2 right-0 translate-x-1/2">
							<div className="flex h-8 w-8 items-center justify-center rounded-full border border-primary/10 bg-white shadow-md">
								<Heart className="h-4 w-4 text-primary" />
							</div>
						</div>
					</div>
				</div>

				{/* Loading text */}
				<div className="space-y-3">
					<h3 className="font-semibold text-foreground text-xl">
						Preparing your kitchen
					</h3>
					<p className="mx-auto max-w-xs text-muted-foreground text-sm">
						Getting everything ready for a great cooking experience
					</p>

					{/* Progress bar */}
					<div className="mx-auto h-1.5 w-48 overflow-hidden rounded-full bg-primary/10">
						<div
							className="h-full rounded-full bg-linear-to-r from-primary to-primary/60"
							style={{
								animation: "loading-progress 2s ease-in-out infinite",
							}}
						/>
					</div>
				</div>
			</div>

			<style>{`
        @keyframes loading-progress {
          0% {
            width: 0%;
            margin-left: 0%;
          }
          50% {
            width: 60%;
            margin-left: 20%;
          }
          100% {
            width: 0%;
            margin-left: 100%;
          }
        }
      `}</style>
		</div>
	);
}
