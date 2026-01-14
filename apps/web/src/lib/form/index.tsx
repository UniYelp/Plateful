import { createFormHook } from "@tanstack/react-form";

import { FieldError, NavBlock, SubmitButton } from "./components";
import { fieldContext, formContext } from "./context";

/**
 * {@link https://tanstack.com/form/latest/docs/framework/react/quick-start}
 * {@link https://tanstack.com/form/latest/docs/framework/react/guides/form-composition}
 */
export const { useAppForm, withFieldGroup, withForm } = createFormHook({
	fieldComponents: {
		FieldError,
	},
	formComponents: {
		NavBlock,
		SubmitButton,
	},
	fieldContext,
	formContext,
});
