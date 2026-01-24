import { workflow } from "../configs/workflow.config";
import { vv } from "../schema";

export const generateRecipeWorkflow = workflow.define({
	args: {
		householdId: vv.id("households"),
		genId: vv.id("recipeGens"),
	},
	// returns: v.string(),
	handler: async (_step, args): Promise<void> => {
		const { householdId, genId } = args;

		console.log({ householdId, genId });

        // step 1: update gen status

        // step 2: action: fetch & sse --> incl. full recipe gen

        // step 3: action: gen image --> attach image to recipe gen
	},
});
