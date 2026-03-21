export const formatQuantity = (quantity: {
	unit?: string | undefined;
	amount: number;
}) => {
	const userLocale = undefined;

	const { amount, unit } = quantity;

	try {
		return new Intl.NumberFormat(userLocale, {
			style: unit ? "unit" : "decimal",
			...(unit && { unit: unit.toLowerCase() }),
			unitDisplay: "narrow",
		}).format(amount);
	} catch (_e) {
		const numberPart = new Intl.NumberFormat(userLocale, {
			style: "decimal",
		}).format(amount);

		return unit ? `${numberPart} ${unit}` : numberPart;
	}
};
