import type { PropsWithChildren } from "react";

import { useFormContext } from "@/lib/form/context";
import { Button } from "../ui/button";

type Props = {
    disabled?: boolean;
}

export function SubmitButton(props: PropsWithChildren<Props>) {
	const { disabled, children = "Submit" } = props;

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
					disabled={disabled || !canSubmit || isPristine || isSubmitting}
				>
					{isSubmitting ? "..." : children}
				</Button>
			)}
		</form.Subscribe>
	);
}
