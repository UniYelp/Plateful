/// <reference types="dom-chromium-ai" />

import { queryOptions } from "@tanstack/react-query";

import {
	aiAvailabilityOptions,
	aiSessionOptions,
	localAiEnabledStorageKey,
} from "./constants";
import { AIStatus } from "./status.enum";

export type AIQueryData =
	| {
			status: Exclude<
				AIStatus,
				typeof AIStatus.Ready | typeof AIStatus.Loading
			>;
			session: null;
	  }
	| {
			status: typeof AIStatus.Loading;
			session: null;
			progress?: number;
	  }
	| {
			status: typeof AIStatus.Ready;
			session: LanguageModel;
	  };

let modelNewlyDownloaded = false;
let globalAiSession: LanguageModel | null = null;

export const aiStatusQueryKey = ["ai-status"] as const;

export const aiStatusQueryOptions = queryOptions<AIQueryData>({
	queryKey: aiStatusQueryKey,
	queryFn: async ({ signal, client }) => {
		if (typeof window === "undefined" || !("LanguageModel" in self)) {
			return { status: AIStatus.None, session: null };
		}

		if (localStorage.getItem(localAiEnabledStorageKey) !== "true") {
			return { status: AIStatus.Disabled, session: null };
		}

		try {
			const availability = await LanguageModel.availability(
				aiAvailabilityOptions,
			);

			if (availability === "unavailable") {
				return { status: AIStatus.None, session: null };
			}

			if (availability !== "available") {
				modelNewlyDownloaded = true;
			}

			console.debug(`LanguageModel is ${availability}.`);

			if (!globalAiSession) {
				const session = await LanguageModel.create({
					...aiSessionOptions,
					signal,
					monitor(m) {
						m.addEventListener("downloadprogress", (e) => {
							console.debug(`Model downloading at ${e.loaded * 100}%.`);

							if (e.loaded > 0) {
								client.setQueryData(aiStatusQueryKey, (old: AIQueryData) => {
									if (old?.status === AIStatus.Loading) {
										return {
											status: AIStatus.Loading,
											session: null,
											progress: e.loaded,
										};
									}

									return old;
								});
							}

							if (modelNewlyDownloaded && e.loaded === 1) {
								client.resetQueries({ queryKey: aiStatusQueryKey });
							}
						});
					},
				});

				globalAiSession = session;
			}

			if (modelNewlyDownloaded) {
				return {
					status: AIStatus.Loading,
					progress: 0,
					session: null,
				};
			}

			return {
				status: AIStatus.Ready,
				session: globalAiSession,
			};
		} catch (err) {
			console.debug("Error loading AI model", err);

			return { status: AIStatus.Error, session: null };
		}
	},
	staleTime: Number.POSITIVE_INFINITY,
});
