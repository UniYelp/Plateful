import { CustomError } from "./custom";

export class ForbiddenError extends CustomError {
	public static override readonly type = "Forbidden";
	public override readonly type = ForbiddenError.type;
}
