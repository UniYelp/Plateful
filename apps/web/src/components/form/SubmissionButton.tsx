import { useFormContext } from "@/lib/form/context";
import { Button } from "../ui/Button";

type Props = {
	label?: string;
};

export function SubscribeButton(props: Props) {
	const { label = "Submit" } = props;

	const form = useFormContext();

	return (
		<form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
			{([canSubmit, isSubmitting]) => (
				<Button type="submit" disabled={!canSubmit || isSubmitting}>
					{isSubmitting ? "..." : label}
				</Button>
			)}
		</form.Subscribe>
	);
}
