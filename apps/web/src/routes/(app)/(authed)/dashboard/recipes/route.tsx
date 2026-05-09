import { createFileRoute } from "@tanstack/react-router";
import { HistoryIcon } from "lucide-react";

import { append } from "&/aggregation";
import type { NavItem } from "@/components/layouts/Navbar";

export const Route = createFileRoute("/(app)/(authed)/dashboard/recipes")({
	staticData: {
		navbar: {
			items: append<NavItem>([
				{
					to: "/dashboard/recipes/gen",
					label: "History",
					icon: <HistoryIcon className="mr-2 h-4 w-4" />,
				},
			]),
		},
	},
});
