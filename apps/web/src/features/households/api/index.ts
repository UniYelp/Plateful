import { convexQuery } from "@convex-dev/react-query";

import { api } from "@backend/api";

export const userCurrentHouseholdQuery = convexQuery(
	api.households.currentUserHousehold,
);
