import { useMutation, useQuery } from "convex/react";
import { ChefHat, ThumbsDown, ThumbsUp } from "lucide-react";

import { api } from "@backend/api";
import type { Id } from "@backend/dataModel";
import { Card, CardContent } from "@/components/ui/card";

interface FeedbackProps {
	recipeId: Id<"recipes">;
}

export const Feedback = ({ recipeId }: FeedbackProps) => {
	const submitFeedback = useMutation(api.recipeFeedbacks.submit);
	const existingFeedback = useQuery(api.recipeFeedbacks.getByRecipeAndUser, {
		recipeId,
	});

	const handleFeedbackClick = async (feedback: "positive" | "negative") => {
		try {
			await submitFeedback({ recipeId, value: feedback });
		} catch (error) {
			console.error("Failed to submit feedback:", error);
		}
	};

	// Hide the feedback card completely if the user has already submitted feedback
	// or if the query is still loading (existingFeedback === undefined)
	if (existingFeedback !== null) {
		return null;
	}

	return (
		<Card className="mt-6 border-primary/20 bg-linear-to-br from-primary/5 to-orange-50">
			<CardContent className="pt-6">
				<div className="text-center">
					<div className="mb-3 flex items-center justify-center gap-2">
						<ChefHat className="h-5 w-5 text-primary" />
						<h3 className="font-semibold text-foreground">
							How was your cooking experience?
						</h3>
					</div>
					<p className="mb-4 text-muted-foreground text-sm">
						Your feedback helps us improve our recipes
					</p>
					<div className="flex items-center justify-center gap-4">
						<button
							type="button"
							onClick={() => handleFeedbackClick("positive")}
							className="group flex flex-col items-center gap-2 rounded-xl border-2 border-transparent bg-white p-4 transition-all duration-200 hover:scale-105 hover:border-green-300 hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2"
							aria-label="Give positive feedback"
						>
							<div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 transition-colors group-hover:bg-green-200">
								<ThumbsUp className="h-6 w-6 text-green-600" />
							</div>
							<span className="font-medium text-green-700 text-sm">
								Delicious!
							</span>
						</button>
						<button
							type="button"
							onClick={() => handleFeedbackClick("negative")}
							className="group flex flex-col items-center gap-2 rounded-xl border-2 border-transparent bg-white p-4 transition-all duration-200 hover:scale-105 hover:border-orange-300 hover:bg-orange-50 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2"
							aria-label="Give constructive feedback"
						>
							<div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 transition-colors group-hover:bg-orange-200">
								<ThumbsDown className="h-6 w-6 text-orange-600" />
							</div>
							<span className="font-medium text-orange-700 text-sm">
								Needs work
							</span>
						</button>
					</div>
				</div>
			</CardContent>
		</Card>
	);
};
