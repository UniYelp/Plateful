import type { ExpiryDetails } from "@plateful/ingredients";
import type { IngredientDoc } from "@backend/ingredients";

export type IngredientDetails = {
	id: IngredientDoc["_id"];
	name: IngredientDoc["name"];
	category: IngredientDoc["category"];
	availableQuantities: (IngredientDoc["quantities"][number] & {
		expiry: ExpiryDetails | null;
	})[];
	expiry: ExpiryDetails | null;
};
