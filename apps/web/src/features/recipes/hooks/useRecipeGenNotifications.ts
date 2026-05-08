import { useQuery } from "convex/react";
import { useEffect, useRef } from "react";
import { api } from "@backend/api";
import { useCurrentHousehold } from "&/households/hooks/useCurrentHouseholds";
import { isCompletedRecipeGen, isFailedRecipeGen, isGeneratingRecipe } from "../utils/status";
import { sendNotification } from "@/utils/notifications";
import type { Id } from "@backend/dataModel";

export function useRecipeGenNotifications() {
	const household = useCurrentHousehold();
	const generations = useQuery(
		api.recipeGens.byHousehold,
		household ? { householdId: household._id } : "skip",
	);

	// Keep track of generations we've already notified about in this session
	const notifiedGens = useRef<Set<Id<"recipeGens">>>(new Set());

	useEffect(() => {
		if (!generations || !household) return;

		const channel = new BroadcastChannel("recipe-gen-notifications");
		const storageKey = `active-gens-${household._id}`;
		
		// Load active gens from storage
		const storedActiveGens = new Set<string>(
			JSON.parse(localStorage.getItem(storageKey) || "[]")
		);

		const newActiveGens = new Set<string>();

		for (const gen of generations) {
			const genId = gen._id;

			// If it's currently active, track it
			if (isGeneratingRecipe(gen) || gen.state.status === "pending") {
				newActiveGens.add(genId);
				continue;
			}

			// If it's not active anymore, but it WAS active (either in this session or a previous one)
			if (storedActiveGens.has(genId) && !notifiedGens.current.has(genId)) {
				const isSuccess = isCompletedRecipeGen(gen);
				const isFailure = isFailedRecipeGen(gen);

				if (isSuccess || isFailure) {
					const notificationKey = `notified-${genId}`;
					
					if (!localStorage.getItem(notificationKey)) {
						localStorage.setItem(notificationKey, "true");
						
						if (isSuccess) {
							sendNotification("Recipe Ready!", {
								body: "Your delicious recipe has been generated successfully.",
							});
						} else {
							sendNotification("Recipe Generation Failed", {
								body: gen.state.reason || "Something went wrong while creating your recipe.",
							});
						}
					}

					notifiedGens.current.add(genId);
				}
			}
			
			// If it's already finished and we didn't know it was active, just mark as notified
			if (!storedActiveGens.has(genId)) {
				notifiedGens.current.add(genId);
			}
		}

		// Save current active gens for next time
		localStorage.setItem(storageKey, JSON.stringify(Array.from(newActiveGens)));

		return () => channel.close();
	}, [generations, household]);
}
