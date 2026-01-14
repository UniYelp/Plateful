import { lazy } from "react";

export const FieldError = lazy(async () => ({
	default: (await import("@/components/forms/FieldError")).FieldError,
}));

export const NavBlock = lazy(async () => ({
	default: (await import("@/components/forms/NavBlock")).NavBlock,
}));

export const SubmitButton = lazy(async () => ({
	default: (await import("@/components/forms/SubmitButton")).SubmitButton,
}));
