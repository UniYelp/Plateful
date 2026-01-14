import { CustomError } from "./custom";

export class NotFoundError extends CustomError {
	public static override readonly type = "NotFound";
	public override readonly type = NotFoundError.type;
}
