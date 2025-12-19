import { useQuery } from "@tanstack/react-query";
import { useAction } from "convex/react";
import { Plus, Users } from "lucide-react";
import { useState } from "react";

import { api } from "@backend/api";
import type { Doc } from "@backend/dataModel";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { HouseholdMember } from "./HouseholdMember";

export const ManageHousehold = ({
	household,
}: {
	household: Doc<"households">;
}) => {
	const [isQuickInviteOpen, setIsQuickInviteOpen] = useState(false);

	const getHouseholdMembersData = useAction(
		api.external_user.getHouseholdMembersData,
	);

	const {
		data: householdMembersData,
		isLoading,
		isError,
		error,
	} = useQuery({
		queryKey: ["household", household._id, "members"],
		queryFn: async () => {
			const data = await getHouseholdMembersData({
				householdId: household._id,
			});

			return data;
		},
	});

	return (
		<div>
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Users className="h-5 w-5" />
						{household.name}
					</CardTitle>
					<CardDescription>Manage your household members</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="space-y-3">
						{isLoading
							? "Loading..."
							: isError
								? `Error: ${error}`
								: householdMembersData?.map((member) => (
										<HouseholdMember key={member.id} {...member} />
									))}
					</div>

					<div className="mt-4 space-y-2 border-border border-t pt-4">
						<Dialog
							open={isQuickInviteOpen}
							onOpenChange={setIsQuickInviteOpen}
						>
							<DialogTrigger asChild>
								<Button
									variant="outline"
									size="sm"
									className="w-full bg-transparent"
								>
									<Plus className="mr-2 h-4 w-4" />
									Invite Member
								</Button>
							</DialogTrigger>
							<DialogContent>
								<DialogHeader>
									<DialogTitle>Quick Invite</DialogTitle>
									<DialogDescription>Coming Soon...</DialogDescription>
								</DialogHeader>
							</DialogContent>
						</Dialog>

						<Button variant="ghost" size="sm" className="w-full" asChild>
							{/* <Link to="/household">
                              <Users className="w-4 h-4 mr-2" />
                              Manage Household
                            </Link> */}
						</Button>
					</div>
				</CardContent>
			</Card>
		</div>
	);
};
