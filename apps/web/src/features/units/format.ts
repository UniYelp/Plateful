import type { StrictOmit, SuggestStr } from "@plateful/types";
import { type Unit, UnitSymbol } from "@plateful/units";

// TODO: m

type Args<TUnit extends SuggestStr<Unit>> = {
	locale?: Intl.LocalesArgument;
	unit: TUnit;
	options: StrictOmit<
		Intl.NumberFormatOptions,
		| "style"
		| "unit"
		| Extract<keyof Intl.NumberFormatOptions, `currency${string}`>
	>;
	onUnsupportedUnit?: (err: unknown) => void;
};

export const getUnitFormatter = <TUnit extends string = string>({
	locale,
	unit,
	options,
	onUnsupportedUnit,
}: Args<TUnit>) => {
	try {
		const fmt = new Intl.NumberFormat(locale, {
			...options,
			unit,
			style: "unit",
		});

		return fmt;
	} catch (err) {
		onUnsupportedUnit?.(err);

		const fmt = new Intl.NumberFormat(locale);

		const unitSymbol =
			options.unitDisplay !== "long"
				? (UnitSymbol[unit as Unit] ?? unit)
				: unit;

		const format: Intl.NumberFormat["format"] = (...args) => {
			const num = fmt.format(...args);

			return `${num}${options.unitDisplay === "narrow" ? "" : " "}${unitSymbol}`;
		};

		// TODO: support other methods & Intl

		return {
			format,
		};
	}
};
