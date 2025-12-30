import type { StandardSchemaV1Issue } from "@tanstack/react-form";

import { isInvalidTouched } from "&/forms/utils/validation";
import { useFieldContext } from "@/lib/form/context";

const mapErrors = (
	errors: (string | StandardSchemaV1Issue | undefined | void)[],
) =>
	errors
		.map((err) => {
			if (typeof err === "string") {
				return err;
			} else if (err && "message" in err) {
				return err.message;
			}
			return "";
		})
		.join(", ");

export const FieldError = () => {
	const field = useFieldContext();

	if (!isInvalidTouched(field)) {
		return null;
	}

	return (
		<p className="text-destructive text-sm">
			{mapErrors(field.state.meta.errors)}
		</p>
	);
};
