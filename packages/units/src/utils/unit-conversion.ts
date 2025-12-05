import { Graph, Option } from "effect";

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
		from: Unit,
		to: Unit,
		initialValue: InitialValue,
	) => CalculationResult | null;
	getConversions: (from: Unit) => Unit[];
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

	const nodeByUnit = {} as Record<Unit, number>;

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

	const convertUnits = (from: Unit, to: Unit, initialValue?: InitialValue) => {
		const source = nodeByUnit[from];
		const target = nodeByUnit[to];

		if (!source || !target) return null;

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

	const getConversions = (from: Unit) => {
		const start = nodeByUnit[from];
		const walker = Graph.bfs(graph, { start: [start] });
		return Array.from(Graph.indices(walker)).flatMap(
			(node) => graph.nodes.get(node) ?? [],
		);
	};

	return { convertUnits, getConversions };
};
