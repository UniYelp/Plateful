import type { PropsWithChildren } from "react";

import { useFormContext } from "@/lib/form/context";
import { Button } from "../ui/button";

export function SubmitButton(props: PropsWithChildren<unknown> & { className?: string }) {
	const { children = "Submit", className } = props;

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
					className={className}
				>
					{isSubmitting ? "..." : children}
				</Button>
			)}
		</form.Subscribe>
	);
}
