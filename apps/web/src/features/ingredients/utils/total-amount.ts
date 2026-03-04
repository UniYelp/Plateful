import { entriesOf } from "@plateful/utils";

export const SCALAR_QUANTITY_KEY = "__scalar__";

export const getTotalAmount = (
	quantities: Array<{
		unit?: string | undefined;
		amount: number;
	}>,
) => {
	const quantityByUnit = getGroupedTotalAmount(quantities);

	const parts: string[] = [];

	for (const [unit, amount] of entriesOf(quantityByUnit)) {
		if (unit === SCALAR_QUANTITY_KEY) {
			parts.push(`${amount}`);
		} else {
			parts.push(`${amount}${unit}`);
		}
	}

	return parts.join(", ");
};


export const getGroupedTotalAmount = (quantities: Array<{
		unit?: string | undefined;
		amount: number;
	}>,) => {
	return quantities.reduce(
		(acc, q) => {
			const unit = q.unit ?? SCALAR_QUANTITY_KEY;
			if (!acc[unit]) acc[unit] = 0;
			acc[unit] += q.amount;
			return acc;
		},
		{} as Record<string, number>,
	);
}