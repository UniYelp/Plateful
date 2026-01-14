import type { PropsWithChildren } from "react";

import { useFormContext } from "@/lib/form/context";
import { Button } from "../ui/button";
import { Spinner } from "../ui/spinner";

type Props = {
	icon?: React.JSX.Element;
	className?: string;
};

export function SubmitButton(props: PropsWithChildren<Props>) {
	const { icon, className, children = "Submit" } = props;

	const form = useFormContext();

	return (
		<form.Subscribe
			selector={(state) => [
				state.isPristine,
				state.isSubmitting,
				state.isValidating,
			]}
		>
			{([isPristine, isSubmitting, isValidating]) => (
				<Button
					type="submit"
					disabled={isPristine || isSubmitting || isValidating}
					className={className}
				>
					{isSubmitting ? <Spinner /> : icon}
					{children}
				</Button>
			)}
		</form.Subscribe>
	);
}
