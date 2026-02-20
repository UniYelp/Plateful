import { Pinecone } from "@pinecone-database/pinecone";
import { tool } from "ai";
import z from "zod";

const getPineconeApiKey = () => {
	const apiKey = process.env.PINECONE_API_KEY;
	if (!apiKey) {
		throw new Error("Pinecone API key is not set in environment variables.");
	}
	return apiKey;
};

const pc = new Pinecone({ apiKey: getPineconeApiKey() });

export const queryPinecone = async ({ query }: { query: string }) => {
	const index = pc.index({ name: process.env.PINECONE_INDEX_NAME });

	const namespace = index.namespace(
		process.env.PINECONE_NAMESPACE || "example-namespace",
	);
	const { result } = await namespace.searchRecords({
		query: {
			topK: 2,
			inputs: { text: query },
		}
	});

	return { result: result.hits };
};

export const searchSafetyInstructions = tool({
	description: "Search safety instructions for a given query",
	inputSchema: z.object({
		query: z.string(),
	}),
	outputSchema: z.object({
		result: z.array(
			z.object({
				_id: z.string(),
				_score: z.number(),
				fields: z.object({
					chunk_text: z.string(),
				}),
			}),
		),
	}),
	execute: queryPinecone,
});
