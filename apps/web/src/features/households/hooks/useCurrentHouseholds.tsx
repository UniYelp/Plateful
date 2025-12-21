import { useQuery } from "convex/react";

import { api } from "@backend/api";

export const useCurrentHousehold = () => {
	const households = useQuery(api.households.getUserHouseholds);
	return households?.[0];
};
