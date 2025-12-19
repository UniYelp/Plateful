import {
	type GoogleGenerativeAIProvider,
	type GoogleGenerativeAIProviderMetadata,
	type GoogleGenerativeAIProviderOptions,
	google,
} from "@ai-sdk/google";
import {
	Experimental_Agent as Agent,
	type Experimental_AgentSettings as AgentSettings,
	type Prompt,
	type ToolSet,
} from "ai";
import dedent from "dedent";

import type { StrictOmit } from "@plateful/types";

type GoogleModel = Parameters<GoogleGenerativeAIProvider>[0];

type GoogleAgentSettings<
	TOOLS extends ToolSet,
	OUTPUT = never,
	OUTPUT_PARTIAL = never,
> = StrictOmit<AgentSettings<TOOLS, OUTPUT, OUTPUT_PARTIAL>, "model"> & {
	model: GoogleModel;
};

export class GoogleAgent<
	TOOLS extends ToolSet,
	OUTPUT = never,
	OUTPUT_PARTIAL = never,
> {
	#agent: Agent<TOOLS, OUTPUT, OUTPUT_PARTIAL>;

	#systemPrompt: string | undefined;

	constructor({
		model,
		system,
		...settings
	}: GoogleAgentSettings<TOOLS, OUTPUT, OUTPUT_PARTIAL>) {
		this.#agent = new Agent({
			...settings,
			model: google(model),
		});

		this.#systemPrompt = system;
	}

	async generate(prompt: string) {
		return this.#agent.generate({
			prompt: dedent`
                ${this.#systemPrompt}

                ---

                ${prompt}
            `,
		} satisfies Prompt & {
			providerMetadata?: GoogleGenerativeAIProviderMetadata;
			providerOptions?: GoogleGenerativeAIProviderOptions;
		});
	}
}
