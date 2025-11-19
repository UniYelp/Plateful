export type UnitConversion<
	ConversionData,
	UnitSymbol extends string = string,
> = {
	from: UnitSymbol;
	to: UnitSymbol;
} & ConversionData;
