import type { AnyFieldApi } from "@tanstack/react-form";

export const ariaInvalid = (field: AnyFieldApi) =>
	!field.state.meta.isValid && field.state.meta.isTouched;

export const focusInvalid = () => {
	const InvalidInput = document.querySelector(
		'[aria-invalid="true"]',
	) as HTMLInputElement;

	InvalidInput?.focus();
};
