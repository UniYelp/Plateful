# Barcode-Service

[General Info](../../notes/Architecture/Backend/Barcode%20Service.md)

---

## Setup

### Redis

#### Via Upstash

1. Sign up for [Upstash](../../notes/Architecture/Services/Upstash.md)
1. Create a redis database
1. Copy both the `REST` and `TCP` environment variables and place them in the [.env](.env) file
1. Make sure you have the following environment variables in your `.env`:
    - `REDIS_URL`

#### Via Vercel

1. Sign up for [Vercel](../../notes/Architecture/Services/Vercel.md)
1. On your team's dashboard, go to `Integrations`, select `Browse Marketplace`
1. Search and click the `Upstash` integration
1. Install the `Upstash for Redis` integration and fill its info
1. Copy the environment variables from `.env.local` and place them in the [.env](.env) file

### Clerk

#### Auth

1. Sign up for [Clerk](../../notes/Architecture/Services/Clerk.md)
1. Create an application in `Clerk`
    - Make sure to enable `Google` sign-in
1. On your `Clerk` dashboard, go to `Configure > API keys`, select `Express` in the `Quick Copy` section and copy its content into the [.env](.env) file
1. Make sure you have the following environment variables in your `.env`:
    - `CLERK_PUBLISHABLE_KEY`
    - `CLERK_SECRET_KEY`
