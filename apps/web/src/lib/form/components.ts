import { lazy } from "react";

export const SubmitButton = lazy(async () => ({
	default: (await import("@/components/forms/SubmitButton")).SubmitButton,
}));
