import Elysia from "elysia";
import { clerkPlugin } from "elysia-clerk";

export const AuthPluginName = "auth";

export const auth = () =>
	new Elysia({ name: AuthPluginName }).use(clerkPlugin()).macro({
		auth: {
			async resolve({ clerk, auth, status }) {
				console.log(typeof auth); // prints undefined // TODO: fix this
				const { userId } = auth?.() ?? {};

				/**
				 * Access the auth state in the context.
				 * See the AuthObject here https://clerk.com/docs/references/nextjs/auth-object#auth-object
				 */
				if (!userId) {
					return status(401);
				}

				/**
				 * For other resource operations, you can use the clerk client from the context.
				 * See what other utilities Clerk exposes here https://clerk.com/docs/references/backend/overview
				 */
				const user = await clerk.users.getUser(userId);

				return { user };
			},
		},
	});
