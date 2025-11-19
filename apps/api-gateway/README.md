# Api-Gateway

[General Info](../../notes/Architecture/Backend/Api%20Gateway.md)

---

## Setup

### Clerk

#### Auth

1. Sign up for [Clerk](../../notes/Architecture/Services/Clerk.md)
1. Create an application in `Clerk`
    - Make sure to enable `Google` sign-in
1. On your `Clerk` dashboard, go to `Configure > API keys`, select `Express` in the `Quick Copy` section and copy its content into the [.env](.env) file
1. Make sure you have the following environment variables in your `.env`:
    - `CLERK_PUBLISHABLE_KEY`
    - `CLERK_SECRET_KEY`
