# Api

[General Info](../../notes/Architecture/Backend/Api.md)

---

## Setup

### ngrok

Follow the guides in [ngrok](../../notes/Architecture/Services/ngrok.md)

### AI

#### Gemini

- [Create your own API key here](https://aistudio.google.com/api-keys)
- Make sure you have the following environment variables in your `.env`:
  - `AGENT_PROVIDERS`
    - The providers, separated by | (pipe)
  - per provider:
    - `AGENT_${PROVIDER}_KEY_${KEY_NAME}`
      - At least one per provider
    - `AGENT_${PROVIDER}_MODELS`
      - At least one per provider
      - separated by | (pipe)
      - JSON { "model": string, "rpm": number, "rpd": number }

### Redis

#### Via Upstash

1. Sign up for [Upstash](../../notes/Architecture/Services/Upstash.md)
1. Create a redis database
1. Copy the `REST` environment variables and place them in the [.env](.env) file
1. Make sure you have the following environment variables in your `.env`:
    - `UPSTASH_REDIS_REST_URL`
    - `UPSTASH_REDIS_REST_TOKEN`

#### Via Vercel

1. Sign up for [Vercel](../../notes/Architecture/Services/Vercel.md)
1. On your team's dashboard, go to `Integrations`, select `Browse Marketplace`
1. Search and click the `Upstash` integration
1. Install the `Upstash for Redis` integration and fill its info
1. Copy the environment variables from `.env.local` and place them in the [.env](.env) file

### Pinecone

1. Go to [Pinecone](https://app.pinecone.io/)
2. In the organization, navigate to the "API Keys" tab on the left sidebar
3. Create a new API key
4. Go to the "Database" tab, select your index, then click the "Namespaces" tab to get your namespace name
5. Make sure you have the following environment variables in your `.env`:

- `PINECONE_API_KEY`
- `PINECONE_INDEX_NAME`
- `PINECONE_NAMESPACE`

### Langfuse

1. Go to [Langfuse](https://cloud.langfuse.com/)
2. Enter the relevant project
3. Go to settings > API keys
4. Create a new API key and copy the variables they provide
5. Add the following environment variables to your `.env`:
   - `LANGFUSE_PUBLIC_KEY`
   - `LANGFUSE_SECRET_KEY`
   - `LANGFUSE_BASE_URL` (optional, defaults to `https://cloud.langfuse.com`)
