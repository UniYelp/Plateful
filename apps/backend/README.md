# Backend

[General Info](../../notes/Architecture/Backend/Backend.md)

---

## Setup

### Convex

1. Sign up for [Convex](../../notes/Architecture/Services/Convex.md)
1. Create a project (or request to join the team's project)
1. Setup Clerk [auth](#auth) or follow [`Convex`'s `Clerk` integration guide](https://docs.convex.dev/auth/clerk) (Stages 1-3)
1. Setup Clerk [webhooks](#webhooks) or follow [Convex's guid](https://docs.convex.dev/auth/database-auth#configure-the-webhook-endpoint-in-clerk)
1. Run `npm run dev` or `npm run dev --filter backend`
1. Use the interactive mode to follow the convex cli prompts (select the project you created in cloud mode)
1. Make sure you have the following environment variables in your `Convex` project:
    - `CLERK_JWT_ISSUER_DOMAIN`
    - `CLERK_WEBHOOK_SECRET`

### Clerk

#### Auth

1. Sign up for [Clerk](../../notes/Architecture/Services/Clerk.md)
1. Create an application in `Clerk`
    - Make sure to enable `Google` sign-in
1. Create a JWT Template
    - In the `Clerk` Dashboard, navigate to the [JWT templates](https://dashboard.clerk.com/last-active?path=jwt-templates) page.
    - Select New template and then from the list of templates, select `Convex`. You'll be redirected to the template's settings page. Do NOT rename the JWT token. It must be called `convex`.
    - Copy and save the Issuer URL somewhere secure. This URL is the issuer domain for `Clerk`'s JWT templates, which is your `Clerk` app's Frontend API URL. In development, it's format will be `<https://verb-noun-00.clerk.accounts.dev>`. In production, it's format will be `<https://clerk>.<your-domain>.com`.
1. Save the `CLERK_JWT_ISSUER_DOMAIN` env variable in your `Convex` dashboard

#### Webhooks

1. On your `Clerk` dashboard, go to Webhooks, click on + Add Endpoint.
1. Set Endpoint URL to `https://<your deployment name>.convex.site/webhooks/clerk` (note the domain ends in `.site`, not `.cloud`). You can see your deployment name in the .env.local file in your project directory, or on your Convex dashboard as part of the Deployment URL. For example, the endpoint URL could be: `https://happy-horse-123.convex.site/webhooks/clerk`.
1. In Message Filtering, select user for all user events (scroll down or use the search input).
1. Click on Create.
1. After the endpoint is saved, copy the Signing Secret (on the right side of the UI), it should start with `whsec_`. Set it as the value of the `CLERK_WEBHOOK_SECRET` environment variable in your `Convex` dashboard.

### GenAi

- Same setup as the api
