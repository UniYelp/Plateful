import type { OneOrMany } from "@plateful/types";
import type { AggregationOp } from "./aggregation-op";

export type Aggregation<T> = OneOrMany<AggregationOp<T>>;
