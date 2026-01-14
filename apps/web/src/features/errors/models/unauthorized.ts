import { CustomError } from "./custom";

export class UnauthorizedError extends CustomError {
	public static override readonly type = "Unauthorized";
	public override readonly type = UnauthorizedError.type;
}
