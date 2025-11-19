import { Migrations } from "@convex-dev/migrations";

import { components /**internal */ } from "./_generated/api.js";
import type { DataModel } from "./_generated/dataModel.js";

/**
 * @see {@link https://www.convex.dev/components/migrations}
 * @see {@link https://stack.convex.dev/intro-to-migrations}
 */
export const migrations = new Migrations<DataModel>(components.migrations);

export const run = migrations.runner();

export const runAll = migrations.runner([
	/**internal.migrations.{migration} */
]);
