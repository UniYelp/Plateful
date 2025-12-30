import type { AnyFieldApi } from "@tanstack/react-form";

export const isInvalidTouched = (field: AnyFieldApi) =>
	!field.state.meta.isValid && field.state.meta.isTouched;

export const focusInvalid = () => {
	queueMicrotask(() => {
		const invalidInput = document.querySelector<HTMLInputElement>(
			'[aria-invalid="true"]',
		);

		invalidInput?.focus();
	});
};
