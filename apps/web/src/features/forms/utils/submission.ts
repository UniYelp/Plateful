import type { AnyFormApi } from "@tanstack/react-form";
import type { FormEvent } from "react";

export const submitFormHandler =
	(form: AnyFormApi) => async (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		e.stopPropagation();
		await form.handleSubmit();
	};
