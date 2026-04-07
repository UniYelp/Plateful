import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "convex/react";
import { api } from "@backend/api";
import { ReceiptScanner } from "@/features/ingredients/components/ReceiptScanner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/dev-scanner" as any)({
	component: DevScannerPage,
});

function DevScannerPage() {
	const households = useQuery(api.households.all);

	if (!households) {
		return (
			<div className="flex h-screen items-center justify-center">
				<Loader2 className="h-8 w-8 animate-spin text-primary" />
			</div>
		);
	}

	const household = households[0]; // Just use the first one for testing

	if (!household) {
		return (
			<div className="flex h-screen items-center justify-center">
				<p>No household found. Please create one first.</p>
			</div>
		);
	}

	return (
		<div className="container mx-auto p-8">
			<Card>
				<CardHeader>
					<CardTitle>Receipt Scanner Test Development Route</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<p className="text-muted-foreground">
						This is a temporary route for testing the receipt scanning flow.
						Using household: <strong>{household.name}</strong>
					</p>
					<div className="flex justify-start">
						<ReceiptScanner householdId={household._id} />
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
