import type { PropsWithChildren } from "react";

import { useFormContext } from "@/lib/form/context";
import { Button } from "../ui/button";

export function SubmitButton(props: PropsWithChildren<unknown>) {
	const { children = "Submit" } = props;

	const form = useFormContext();

	return (
		<form.Subscribe
			selector={(state) => [
				state.canSubmit,
				state.isPristine,
				state.isSubmitting,
			]}
		>
			{([canSubmit, isPristine, isSubmitting]) => (
				<Button
					type="submit"
					disabled={!canSubmit || isPristine || isSubmitting}
				>
					{isSubmitting ? "..." : children}
				</Button>
			)}
		</form.Subscribe>
	);
}
