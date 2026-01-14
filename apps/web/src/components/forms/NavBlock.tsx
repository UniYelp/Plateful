import { Block } from "@tanstack/react-router";

import { useFormContext } from "@/lib/form/context";

export const NavBlock = () => {
	const form = useFormContext();

	return (
		<form.Subscribe selector={(state) => [state.isPristine]}>
			{([isPristine]) => (
				<Block
					shouldBlockFn={() => {
						if (isPristine) return false;

						const shouldLeave = confirm("Are you sure you want to leave?");
						return !shouldLeave;
					}}
					enableBeforeUnload={!isPristine}
				/>
			)}
		</form.Subscribe>
	);
};
