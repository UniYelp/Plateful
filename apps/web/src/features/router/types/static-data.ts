import type { Aggregation } from "&/aggregation";
import type { NavItem } from "@/components/layouts/Navbar";

export type StaticRouteData = {
	// backLink: //TODO: add backLink logic
	header?: {
		actions?: Aggregation<React.ReactElement>;
	};
	navbar?: {
		items?: Aggregation<NavItem>;
	};
	loader?: React.ReactElement;
};
