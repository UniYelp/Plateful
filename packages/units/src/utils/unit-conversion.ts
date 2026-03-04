import { Graph, Option } from "effect";
import type { NodeIndex } from "effect/Graph";

import type { SuggestStr } from "@plateful/types";
import { isDefined } from "@plateful/utils";
import type { UnitConversion } from "../types";

type UnitConversionParams<
	Unit extends string,
	TUnitConversion extends UnitConversion<unknown, Unit>,
	Conversion,
	InitialValue,
	CalculationResult,
> = {
	units: readonly Unit[];
	conversions: readonly TUnitConversion[];
	getConversion: (conversion: TUnitConversion) => Conversion;
	getReverseConversion: (conversion: TUnitConversion) => Conversion;
	cost: (edgeData: Conversion) => number;
	calculate: (
		res: { conversions: Conversion[] },
		initialValue?: InitialValue,
	) => CalculationResult;
};

type UnitConversionRes<Unit extends string, InitialValue, CalculationResult> = {
	convertUnits: (
		from: SuggestStr<Unit>,
		to: SuggestStr<Unit>,
		initialValue: InitialValue,
	) => CalculationResult | null;
	getConversions: (from: SuggestStr<Unit>) => Unit[];
};

export const unitConversion = <
	const Unit extends string,
	TUnitConversion extends UnitConversion<unknown, NoInfer<Unit>>,
	Conversion,
	InitialValue,
	CalculationResult,
>({
	units,
	conversions,
	getConversion,
	getReverseConversion,
	cost,
	calculate,
}: UnitConversionParams<
	Unit,
	TUnitConversion,
	Conversion,
	InitialValue,
	CalculationResult
>): UnitConversionRes<Unit, InitialValue, CalculationResult> => {
	const conversionsByUnit = Object.groupBy(
		conversions,
		(conversion) => conversion.from,
	);

	const nodeByUnit = {} as Record<Unit, NodeIndex>;

	const graph = Graph.directed<Unit, Conversion>((mutable) => {
		for (const unit of units) {
			nodeByUnit[unit] = Graph.addNode(mutable, unit);
		}

		for (const unit of units) {
			const unitNode = nodeByUnit[unit];
			const unitConversions = conversionsByUnit[unit];

			if (unitConversions === undefined) continue;

			for (const conversion of unitConversions) {
				const conversionNode = nodeByUnit[conversion.to];

				Graph.addEdge(
					mutable,
					unitNode,
					conversionNode,
					getConversion(conversion),
				);

				Graph.addEdge(
					mutable,
					conversionNode,
					unitNode,
					getReverseConversion(conversion),
				);
			}
		}
	});

	const convertUnits = (
		from: SuggestStr<Unit>,
		to: SuggestStr<Unit>,
		initialValue?: InitialValue,
	) => {
		const source = nodeByUnit[from as Unit];
		const target = nodeByUnit[to as Unit];

		if (!isDefined(source) || !isDefined(target)) return null;

		const res = Graph.dijkstra(graph, {
			source,
			target,
			cost,
		});

		return Option.match(res, {
			onNone: () => null,
			onSome: (res) =>
				calculate(
					{
						conversions: res.costs,
					},
					initialValue,
				),
		});
	};

	const getConversions = (from: SuggestStr<Unit>) => {
		const start = nodeByUnit[from as Unit];

		if (!isDefined(start)) return [];

		const walker = Graph.bfs(graph, { start: [start] });
		return Array.from(Graph.values(walker));
	};

	return { convertUnits, getConversions };
};
