---
website: https://tanstack.com/query
tags:
  - library
  - react
  - web
  - api
---
A powerful data-fetching and caching library for [[Architecture/Stack/React]] that simplifies server-state management. It provides declarative APIs for managing loading states, error handling, caching, and background refetching, all without having to manually write boilerplate `useEffect` + `fetch` code.

A key advantage is how seamlessly it integrates with [[TanStack Router]] from the [[TanStack]] ecosystem. Because both libraries are designed to work together, routing and data-fetching can be co-located and declaratively defined. This makes for a smooth flow where routes can define their own data requirements, and React Query automatically keeps that data fresh.

In our stack, React Query complements both [[Architecture/Services/Convex]] and [[Hono]] services:
- With Convex, it can directly hook into queries and mutations, benefiting from Convex’s real-time updates.
- With Hono, it makes REST API calls feel declarative and type-safe, leveraging React Query’s caching and background syncing.
    
This combination makes data management across our app both predictable and efficient.