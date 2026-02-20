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

let _pc: Pinecone | undefined;
const getPineconeClient = () => {
	if (!_pc) {
		_pc = new Pinecone({ apiKey: getPineconeApiKey() });
	}
	return _pc;
};

export const queryPinecone = async ({ query }: { query: string }) => {
	const indexName = process.env.PINECONE_INDEX_NAME;
	if (!indexName) {
		throw new Error("PINECONE_INDEX_NAME is not set in environment variables.");
	}
	const index = getPineconeClient().index({
		name: indexName,
	});

	const namespaceName = process.env.PINECONE_NAMESPACE;
	if (!namespaceName) {
		throw new Error("PINECONE_NAMESPACE is not set in environment variables.");
	}
	const namespace = index.namespace(namespaceName);

	const { result } = await namespace.searchRecords({
		query: {
			topK: 2,
			inputs: { text: query },
		},
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
