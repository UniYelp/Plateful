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
			status: Exclude<AIStatus, typeof AIStatus.Ready>;
			session: null;
	  }
	| {
			status: typeof AIStatus.Ready;
			session: LanguageModel;
	  };

let globalAiSession: LanguageModel | null = null;

type ProgressHandler = (e: ProgressEvent) => void;
const progressHandlers = new Set<ProgressHandler>();

export const addAiProgressListener = (handler: ProgressHandler) => {
	progressHandlers.add(handler);

	return () => {
		progressHandlers.delete(handler);
	};
};

export const aiStatusQueryKey = ["ai-status"] as const;

export const aiStatusQueryOptions = queryOptions<AIQueryData>({
	queryKey: aiStatusQueryKey,
	queryFn: async ({ client }) => {
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

			let modelNewlyDownloaded = false;

			if (availability !== "available") {
				modelNewlyDownloaded = true;
			}

			console.debug(`LanguageModel is ${availability}.`);

			if (!globalAiSession) {
				globalAiSession = await LanguageModel.create({
					...aiSessionOptions,
					monitor(m) {
						m.addEventListener("downloadprogress", (e) => {
							for (const handler of progressHandlers) {
								handler(e);
							}

							if (modelNewlyDownloaded && e.loaded === 1) {
								console.debug("Model downloaded, resetting queries");
								client.resetQueries({ queryKey: aiStatusQueryKey });
							}
						});
					},
				});
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
