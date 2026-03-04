import type { MemberRole } from "@backend/values";
import { Badge } from "../ui/badge";

type HouseholdMemberProps = {
	role: MemberRole;
	fullName: string | null;
	email: string | undefined;
};

export const HouseholdMember = ({
	role,
	fullName,
	email,
}: HouseholdMemberProps) => {
	return (
		<div className="flex items-center gap-3">
			<div className="flex-1">
				<p className="font-medium text-sm">{fullName}</p>
				<p className="text-muted-foreground text-xs">{email}</p>
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
