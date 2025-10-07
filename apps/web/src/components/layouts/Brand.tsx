import { ChefHat } from "lucide-react";

import { appConfig } from "@/configs/app.config";

export function Brand() {
	return (
		<div className="flex items-center gap-2">
			<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
				<ChefHat className="h-5 w-5 text-primary-foreground" />
			</div>
			<span className="font-bold text-foreground text-xl">
				{appConfig.appName}
			</span>
		</div>
	);
}
