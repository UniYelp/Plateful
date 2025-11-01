---
stack:
  - "[[Architecture/Stack/TypeScript]]"
  - "[[Hono]]"
---
The **Barcode Service** is responsible for managing scanned barcodes within our system.

## Workflow
- A user scans a barcode in the [[Mobile]] app.
- The service receives the request.
- It first checks the [[Redis]] cache for existing information.
    - If a match is found, the cached data is returned immediately.
    - If no match is found:
        - The service queries external food APIs.
        - If data is found, it is cached in [[Upstash]] (Redis) for faster future lookups and then returned to the user.
        - If no data exists in the external APIs, the service responds with a "not found," and the user can provide the missing information themselves.

## Why Hono Instead of Elixir?

Initially, we considered building this as an [[Elixir]] service with Phoenix, given Elixir’s strong concurrency model and robustness for real-time services. However, we decided to go with [[Hono]] (a lightweight, high-performance TypeScript framework) instead.

The main reasons:
- **Unified Stack with TypeScript**: Using Hono keeps everything in [[Turborepo]] under one ecosystem. Both frontend and backend services share the same language, tooling, and types. This makes development more efficient and reduces the cognitive overhead of switching contexts between TypeScript and Elixir.
- **Code Sharing**: Since our front-end already uses TypeScript, having the service in the same language allows us to share validation schemas, types, and possibly even business logic across [[Mobile]], [[Web]], and backend services.
- **Developer Experience**: The DX of Hono with TypeScript, Vercel deployments, and pnpm/Turborepo integration is streamlined. This provides fast iteration cycles, consistent tooling, and easier onboarding for developers already familiar with TypeScript.
- **Simplicity of Requirements**: Our service doesn’t need Elixir’s advanced concurrency or fault-tolerance capabilities. The core logic is mostly cache lookups and API calls—tasks that TypeScript with Hono handles very well.
- **Hosting and Infrastructure**: With [[Vercel]] and [[Upstash]], deploying and scaling a TypeScript-based Hono service is straightforward, serverless-friendly, and integrates seamlessly with our existing infrastructure.

In short, while Elixir is powerful and would shine in high-concurrency, low-latency scenarios, the Barcode Service fits more naturally into our existing TypeScript monorepo. By choosing Hono, we optimize for maintainability, consistency, and developer velocity.