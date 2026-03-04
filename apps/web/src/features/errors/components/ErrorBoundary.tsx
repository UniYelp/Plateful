import { Link } from "@tanstack/react-router";
import { AlertTriangle, Home, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

export function ErrorBoundary({
	error: _error,
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	return (
		<div className="flex h-[80vh] items-center justify-center to-destructive/5 p-4">
			<Card className="w-full max-w-lg border-2 border-destructive/20">
				<CardHeader className="space-y-4 text-center">
					<div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10">
						<AlertTriangle className="h-10 w-10 text-destructive" />
					</div>
					<div>
						<CardTitle className="text-2xl">Something Went Wrong</CardTitle>
						<CardDescription className="mt-2">
							Oops! We burned this recipe. Don't worry, we're on it. Try
							refreshing or head back to the dashboard.
						</CardDescription>
					</div>
				</CardHeader>
				<CardContent className="space-y-3">
					<Button className="w-full" size="lg" onClick={reset}>
						<RefreshCw className="mr-2 h-5 w-5" />
						Try Again
					</Button>
					<Button
						variant="outline"
						className="w-full bg-transparent"
						size="lg"
						asChild
					>
						<Link to="/dashboard">
							<Home className="mr-2 h-5 w-5" />
							Back to Dashboard
						</Link>
					</Button>
				</CardContent>
			</Card>
		</div>
	);
}
