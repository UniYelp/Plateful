import { entriesOf } from "@plateful/utils";
import { ScalarQuantity } from "&/units/constants";

export const getTotalAmount = (
	quantities: Array<{
		unit?: string | undefined;
		amount: number;
	}>,
) => {
	const quantityByUnit = getGroupedTotalAmount(quantities)

	const parts: (string | number)[] = entriesOf(quantityByUnit).map(
		([unit, amount]) => `${amount}${unit as string}`,
	);

	const scalarAmount = quantityByUnit[ScalarQuantity];
	if (scalarAmount !== undefined) {
		parts.push(scalarAmount);
	}

	return parts.join(", ");
};


export const getGroupedTotalAmount = (quantities: Array<{
		unit?: string | undefined;
		amount: number;
	}>,) => {
        return quantities.reduce(
		(acc, q) => {
			const unit = q.unit ?? ScalarQuantity;
			if (!acc[unit]) acc[unit] = 0;
			acc[unit] += q.amount;
			return acc;
		},
		{} as Record<string | typeof ScalarQuantity, number>,
	);
}