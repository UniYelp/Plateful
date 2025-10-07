import { lazy } from "react";

export const SubscribeButton = lazy(async () => ({
	default: (await import("@/components/form/SubmissionButton")).SubscribeButton,
}));
