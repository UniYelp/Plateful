import {
	Array as Arr,
	Config,
	ConfigProvider,
	Effect,
	HashMap,
	Schema,
} from "effect";

const AgentConfig = Config.nested("AGENT");

const AgentProviderConfig = <T>(config: Config.Config<T>, provider: string) =>
	config.pipe(Config.nested(provider), AgentConfig);

const ProviderKeysConfig = (provider: string) =>
	AgentProviderConfig(
		Config.hashMap(Config.redacted(Config.string()), "KEY"),
		provider,
	).pipe(
		Config.validate({
			message: `Must provide at least one key for the provider | ${provider}`,
			validation: (keys) => HashMap.size(keys) > 0,
		}),
	);

const ProviderModelsConfig = (provider: string) =>
	AgentProviderConfig(
		Config.array(Config.nonEmptyString(), "MODELS"),
		provider,
	).pipe(
		Config.validate({
			message: `Must provide at least one model config for the provider | ${provider}`,
			validation: (models) => models.length > 0,
		}),
	);

const ModelConfigSchema = Schema.Struct({
	model: Schema.NonEmptyString,
	rpm: Schema.Number,
	rpd: Schema.Number,
});

const decodeModelsConfigs = Schema.decodeUnknown(
	Schema.Array(Schema.parseJson(ModelConfigSchema)),
);

const LoadAgentSecrets = Effect.gen(function* () {
	const providers = yield* AgentConfig(
		Config.array(Config.nonEmptyString(), "PROVIDERS"),
	);

	const providersConfig = yield* Effect.forEach(
		providers,
		Effect.fnUntraced(function* (provider) {
			const providerConfigKey = provider.toLocaleUpperCase();

			const keys = yield* ProviderKeysConfig(providerConfigKey);
			const models = yield* ProviderModelsConfig(providerConfigKey);

			const modelsConfig = yield* decodeModelsConfigs(models).pipe(
				Effect.map(Arr.map(({ model, ...config }) => [model, config] as const)),
				Effect.map(HashMap.fromIterable),
			);

			return [provider, { keys, models: modelsConfig }] as const;
		}),
	).pipe(Effect.map(HashMap.fromIterable));

	return providersConfig;
});

export const AgentsConfig = LoadAgentSecrets.pipe(
	Effect.withConfigProvider(ConfigProvider.fromEnv({ seqDelim: "|" })),
	Effect.runSync,
);
