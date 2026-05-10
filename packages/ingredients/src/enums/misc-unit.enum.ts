import type { ValueOf } from "@plateful/types";
import { Enum } from "@plateful/utils";

export const MiscUnit = {
	Slice: "slice",
	Clove: "clove",
	Leaf: "leaf",
	Dash: "dash",
	Drop: "drop",
	Handful: "handful",
	Sprig: "sprig",
	Stalk: "stalk",
	Ear: "ear",
	Head: "head",
	Bunch: "bunch",
	Piece: "piece",
	Can: "can",
	Bottle: "bottle",
	Package: "package",
	Box: "box",
	Bag: "bag",
	Jar: "jar",
	Scoop: "scoop",
} as const;

export type MiscUnit = ValueOf<typeof MiscUnit>;

export const miscUnits = Enum.toTuple(MiscUnit);
