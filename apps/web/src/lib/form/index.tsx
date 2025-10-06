import { createFormHook } from "@tanstack/react-form";

import { SubscribeButton } from "&/forms/components";
import { fieldContext, formContext } from "./context";

export const { useAppForm, withFieldGroup, withForm } = createFormHook({
	fieldComponents: {},
	formComponents: {
		SubscribeButton,
	},
	fieldContext,
	formContext,
});
