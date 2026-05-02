import { UserButton } from "@clerk/clerk-react";
import { convexQuery } from "@convex-dev/react-query";
import { usePostHog } from "@posthog/react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useMutation } from "convex/react";
import { SlidersIcon } from "lucide-react";

import type { ValueOf } from "@plateful/types";
import { api } from "@backend/api";
import { PreferencesForm } from "&/preferences/form/PreferencesForm";
import type { PreferencesFormOutput } from "&/preferences/form/schema";

const UserPreferencesPage = () => {
	const posthog = usePostHog();
	const upsertUserPreferences = useMutation(api.userPreferences.upsert);

	const { data: userPreferences } = useSuspenseQuery(
		convexQuery(api.userPreferences.byActiveUser),
	);

	const onSubmit = async (value: PreferencesFormOutput) => {
		await upsertUserPreferences(value);

		posthog.capture("preferences_update", {
			source: "clerk_user_profile",
		});
	};

	return (
		<PreferencesForm onSubmit={onSubmit} defaultValues={userPreferences} />
	);
};

const UserProfilePage = {
	Preferences: "preferences",
} as const;

type UserProfilePage = ValueOf<typeof UserProfilePage>;

const iconByPage = {
	[UserProfilePage.Preferences]: <SlidersIcon />,
} satisfies Record<UserProfilePage, React.ReactNode>;

const componentByPage = {
	[UserProfilePage.Preferences]: UserPreferencesPage,
} satisfies Record<UserProfilePage, React.ComponentType>;

export function UserProfile() {
	return (
		<UserButton>
			<UserButton.MenuItems>
				{Object.entries(UserProfilePage).map(([label, url]) => (
					<UserButton.Action
						key={url}
						label={label}
						labelIcon={iconByPage[url]}
						open={url}
					/>
				))}
			</UserButton.MenuItems>

			{Object.entries(UserProfilePage).map(([label, url]) => {
				const Page = componentByPage[url];

				return (
					<UserButton.UserProfilePage
						key={url}
						label={label}
						labelIcon={iconByPage[url]}
						url={url}
					>
						<Page />
					</UserButton.UserProfilePage>
				);
			})}
		</UserButton>
	);
}
