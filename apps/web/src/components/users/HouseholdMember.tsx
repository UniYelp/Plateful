import { useQuery } from "@tanstack/react-query";
import { useAction } from "convex/react";
import { useState } from "react";

import { api } from "@backend/api";
import type { Id } from "@backend/dataModel";
import { Badge } from "../ui/badge";

type HouseholdMemberProps = {
	_id: Id<"householdMembers">;
	_creationTime: number;
	deletedAt?: number | undefined;
	userId: Id<"users">;
	role: "manager" | "member";
	updatedAt: number;
	createdBy: Id<"users"> | "sys";
	updatedBy: Id<"users"> | "sys";
	householdId: Id<"households">;
	joinedAt: number;
};

type MemberData = {
	fullName: string | null;
	firstName: string | null;
	lastName: string | null;
	email: string | undefined;
} | null;

export const HouseholdMember = ({ userId, role }: HouseholdMemberProps) => {
	const fetchUserDataAction = useAction(api.userData.getUserData);

	const {
		data: userData,
		isLoading,
		isError,
		error,
	} = useQuery({
		queryKey: ["household", userId, "members"],
		queryFn: async () => {
			const data = await fetchUserDataAction({
				userId: userId,
			});

			return data;
		},
	});

	if (isLoading) {
		return <div>Loading...</div>;
	}

	if (isError) {
		return <div>Error: {error?.message}</div>;
	}

	if (!userData) {
		return <div>No user data found.</div>;
	}

	return (
		<div key={userId} className="flex items-center gap-3">
			<div className="flex-1">
				<p className="font-medium text-sm">{userData.fullName}</p>
				<p className="text-muted-foreground text-xs">{userData.email}</p>
			</div>
			<Badge
				variant={role === "manager" ? "default" : "secondary"}
				className="text-xs"
			>
				{role}
			</Badge>
		</div>
	);
};
