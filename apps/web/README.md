# Web

[General Info](../../notes/Architecture/Frontend/Web.md)

---

## Setup

### Backend

1. Setup the [backend](../backend/README.md#setup)
1. Copy your `Convex` project deployment url and set its value to the `VITE_CONVEX_URL` env variable in the [.env](.env) file
    - You can find it in your project's `dashboard > Settings > URL & Deploy Key > Show development credentials > Deployment URL`
1. Make sure you have the following environment variables in your `.env` project:
    - `VITE_CONVEX_URL`

### Auth

1. Setup [Clerk](../backend/README.md#clerk) if you haven't done so already
1. On your `Clerk` dashboard, go to `Configure > API keys`, select `React` in the `Quick Copy` section and copy its content into the [.env](.env) file as the `VITE_CLERK_PUBLISHABLE_KEY` env var.
1. Make sure you have the following environment variables in your `.env` project:
    - `VITE_CONVEX_URL`
    - `VITE_CLERK_PUBLISHABLE_KEY`

### Monitoring

1. Sign up for [Posthog](../../notes/Architecture/Services/PostHog.md)
1. Create a project (or request to join the team's project)
1. Follow [`PostHog`'s guide](https://posthog.com/docs/libraries/react)
1. Make sure you have the following environment variables in your `.env` project:
    - `VITE_PUBLIC_POSTHOG_KEY`
    - `VITE_PUBLIC_POSTHOG_HOST`
