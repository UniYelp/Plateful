import { useUser } from "@clerk/clerk-react";
import { usePostHog } from "@posthog/react";
import { useEffect, useEffectEvent } from "react";

import type { Maybe } from "@plateful/types";

type User = NonNullable<ReturnType<typeof useUser>["user"]>;

export const usePosthogUserSetup = () => {
	const posthog = usePostHog();
	const { user } = useUser();
	// const { organization } = useOrganization();

	const identifyUser = useEffectEvent((user: Maybe<User>) => {
		if (!user) return;

		posthog?.identify(user.id, {
			email: user.primaryEmailAddress?.emailAddress,
			username: user.username,
		});

		// if (organization) {
		// 	posthog?.group("organization", organization.id);
		// }
	});

	useEffect(() => {
		identifyUser(user);
	}, [user]);
};
