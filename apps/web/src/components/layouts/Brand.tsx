import { ChefHat } from "lucide-react";

import { APP } from "@/configs/app.config";

export function Brand() {
	return (
		<button
			type="button"
			className="flex cursor-pointer items-center gap-2"
		>
			<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
				<ChefHat className="h-5 w-5 text-primary-foreground" />
			</div>
			<span className="font-bold text-foreground text-xl">{APP.name}</span>
		</button>
	);
}
