import { useUser } from "@clerk/clerk-react";
import { usePostHog } from "@posthog/react";
import { useEffect } from "react";

export const usePosthogUserSetup = () => {
	const posthog = usePostHog();
	const { user } = useUser();
	// const { organization } = useOrganization();

	useEffect(() => {
		if (user && posthog) {
			posthog.identify(user.id, {
				email: user.primaryEmailAddress?.emailAddress,
				username: user.username,
			});

			// if (organization) {
			// 	posthog.group("organization", organization.id);
			// }
		}
	}, [posthog, user]);
};
