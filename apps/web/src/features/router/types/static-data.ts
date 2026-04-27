import type { Aggregation } from "&/aggregation";
import type { NavItem } from "@/components/layouts/Navbar";

export type StaticRouteData = {
	// backLink: //TODO: add backLink logic
	navbar?: {
		items?: Aggregation<NavItem>;
	};
	loader?: React.ReactElement;
};
