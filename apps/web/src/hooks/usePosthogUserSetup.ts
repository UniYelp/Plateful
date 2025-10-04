import { useUser } from "@clerk/clerk-react";
import { usePostHog } from "posthog-js/react";
import { useEffect } from "react";

export const usePosthogUserSetup = () => {
	const posthog = usePostHog();
	const { user } = useUser();

	useEffect(() => {
		if (user && posthog) {
			posthog.identify(user.id, {
				email: user?.primaryEmailAddress?.emailAddress,
			});
		}
	}, [posthog, user]);
};
