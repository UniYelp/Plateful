import {
	CheckCircle2,
	Flame,
	ShieldCheck,
	Sparkles,
	Utensils,
} from "lucide-react";

export const stageStatusDetails = [
	{
		id: "pending",
		label: "Starting Up",
		description: "Warming up the kitchen...",
		icon: Flame,
		duration: 2000,
	},
	{
		id: "generating",
		label: "Crafting Your Recipe",
		description: "Mixing ingredients and finding the perfect combination...",
		icon: Utensils,
		duration: 4000,
	},
	{
		id: "validating",
		label: "Safety Check",
		description: "Making sure everything is safe and delicious...",
		icon: ShieldCheck,
		duration: 2500,
	},
	{
		id: "completed",
		label: "Recipe Ready!",
		description: "Your recipe has been created successfully",
		icon: CheckCircle2,
		duration: 1500,
	},
] as const;

type stageId = (typeof stageStatusDetails)[number]["id"];

export function RecipeGenStatus({ currentStep }: { currentStep: stageId }) {
	const currentStageIndex =
		stageStatusDetails.findIndex((stage) => stage.id === currentStep) || 0;
	const currentStage = stageStatusDetails[currentStageIndex];

	const StageIcon = currentStage.icon;

	return (
		<div className="flex min-h-full items-center justify-center overflow-hidden bg-background">
			{/* Animated background layer */}
			<div className="pointer-events-none fixed inset-0">
				{/* Radial gradient that shifts with stages */}
				<div
					className="absolute inset-0 transition-opacity duration-1000"
					style={{
						background: `radial-gradient(ellipse 80% 60% at 50% 40%, var(--primary) / 0.08, transparent)`,
					}}
				/>

				{/* Floating particles */}
				{Array.from({ length: 12 }).map((_, i) => (
					<div
						key={`particle-${i}`}
						className={`absolute h-1.5 w-1.5 animate-float-particle rounded-full bg-primary/20`}
						style={
							{
								left: `${10 + ((i * 17) % 80)}%`,
								top: `${10 + ((i * 23) % 80)}%`,
								animationDuration: `${3 + (i % 4)}s`,
								animationDelay: `${(i % 5) * 0.2}s`,
							} as React.CSSProperties
						}
					/>
				))}

				{/* Orbiting dots around center */}
				{Array.from({ length: 6 }).map((_, i) => (
					<div
						key={`orbit-${i}`}
						className="-translate-x-1/2 -translate-y-1/2 absolute top-1/2 left-1/2"
						style={{
							width: `${200 + i * 60}px`,
							height: `${200 + i * 60}px`,
							animation: `spin ${8 + i * 3}s linear infinite${i % 2 === 0 ? " reverse" : ""}`,
						}}
					>
						<div className="-translate-x-1/2 absolute top-0 left-1/2 h-1 w-1 rounded-full bg-primary/15" />
					</div>
				))}
			</div>

			<div className="relative z-10 mx-auto w-full max-w-lg px-6 pt-50">
				{/* Main animation area */}
				<div className="flex flex-col items-center">
					{/* Central icon with rings */}
					<div className="relative mb-10">
						{/* Outer pulsing ring */}
						<div
							className="-m-8 absolute inset-0 animate-ping rounded-full border-2 border-primary/10"
							style={{ animationDuration: "3s" }}
						/>

						{/* Rotating dashed ring */}
						<div
							className="-m-6 absolute inset-0 rounded-full border-2 border-primary/20 border-dashed"
							style={{ animation: "spin 10s linear infinite" }}
						/>

						{/* Inner glow */}
						<div className="-m-3 absolute inset-0 animate-pulse rounded-full bg-primary/10" />

						{/* Icon container */}
						<div
							className="relative flex h-24 w-24 items-center justify-center rounded-2xl shadow-lg transition-all duration-500"
							style={{
								background:
									currentStageIndex === stageStatusDetails.length - 1
										? "linear-gradient(135deg, rgb(34 197 94), rgb(16 185 129))"
										: "linear-gradient(135deg, var(--primary), var(--accent))",
							}}
						>
							<StageIcon className="h-12 w-12 animate-grow-shrink text-white transition-transform duration-500" />

							{/* Sparkle accents */}
							<Sparkles
								className="-top-2 -right-2 absolute h-5 w-5 animate-pulse text-primary"
								style={{ animationDelay: "0.5s" }}
							/>
							<Sparkles
								className="-bottom-1 -left-2 absolute h-4 w-4 animate-pulse text-accent"
								style={{ animationDelay: "1s" }}
							/>
						</div>
					</div>

					{/* Stage label and description */}
					<div className="mb-10 space-y-2 text-center">
						<h2
							className="animate-fade-in-up font-bold text-2xl text-foreground transition-all duration-300"
							key={currentStage.id}
						>
							{currentStage.label}
						</h2>
						<p
							className="mx-auto max-w-xs animate-fade-in-up-delayed-both text-muted-foreground text-sm"
							key={`desc-${currentStage.id}`}
						>
							{currentStage.description}
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}

export const RecipeGenStatusSmall = ({
	currentStep,
}: {
	currentStep: stageId;
}) => {
	const stage =
		stageStatusDetails.find((s) => s.id === currentStep) ||
		stageStatusDetails[0];
	const Icon = stage.icon;
	return (
		<div className="flex w-15 max-w-sm items-center gap-3">
			<div key={stage.id} className="flex flex-1 flex-col items-center gap-2">
				{/* Stage dot */}
				<div className="relative">
					<div
						className={`flex h-10 w-10 scale-110 items-center justify-center rounded-full bg-primary/15 text-primary shadow-md shadow-primary/10 transition-all duration-500`}
					>
						<Icon className="h-4 w-4" />
					</div>

					{/* Active pulse ring */}

					<div
						className="-m-1 absolute inset-0 animate-ping rounded-full border-2 border-primary/30"
						style={{ animationDuration: "2s" }}
					/>
				</div>
			</div>
		</div>
	);
};
