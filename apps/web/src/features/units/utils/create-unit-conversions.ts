import { Graph, Option } from "effect";

import type { UnitConversion } from "../types";

type UnitConversionParams<
	UnitSymbol extends string,
	TUnitConversion extends UnitConversion<unknown, UnitSymbol>,
	Conversion,
	InitialValue,
> = {
	units: readonly UnitSymbol[];
	conversions: readonly TUnitConversion[];
	getConversion: (conversion: TUnitConversion) => Conversion;
	getReverseConversion: (conversion: TUnitConversion) => Conversion;
	cost: (edgeData: Conversion) => number;
	calculate: (
		path: Graph.PathResult<Conversion>,
		initialValue?: InitialValue,
	) => number;
};

type UnitConversionRes<UnitSymbol extends string, InitialValue> = {
	convertUnits: (
		from: UnitSymbol,
		to: UnitSymbol,
		initialValue: InitialValue,
	) => number | null;
	getConversions: (from: UnitSymbol) => UnitSymbol[];
};

export const createUnitConversion = <
	const UnitSymbol extends string,
	TUnitConversion extends UnitConversion<unknown, NoInfer<UnitSymbol>>,
	Conversion,
	InitialValue,
>({
	units,
	conversions,
	getConversion,
	getReverseConversion,
	cost,
	calculate,
}: UnitConversionParams<
	UnitSymbol,
	TUnitConversion,
	Conversion,
	InitialValue
>): UnitConversionRes<UnitSymbol, InitialValue> => {
	const conversionsByUnit = Object.groupBy(
		conversions,
		(conversion) => conversion.from,
	);

	const nodeByUnit = {} as Record<UnitSymbol, number>;

	const graph = Graph.directed<UnitSymbol, Conversion>((mutable) => {
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
		from: UnitSymbol,
		to: UnitSymbol,
		initialValue?: InitialValue,
	) => {
		const path = Graph.dijkstra(graph, {
			source: nodeByUnit[from],
			target: nodeByUnit[to],
			cost,
		});

		return Option.match(path, {
			onNone: () => null,
			onSome: (path) => calculate(path, initialValue),
		});
	};

	const getConversions = (from: UnitSymbol) => {
		const start = nodeByUnit[from];
		const walker = Graph.bfs(graph, { start: [start] });
		return Array.from(Graph.indices(walker)).map(
			(node) => graph.nodes.get(node)!,
		);
	};

	return { convertUnits, getConversions };
};
