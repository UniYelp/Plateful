import { CustomError, type CustomErrorOptions } from "./custom";

type ConflictErrorOptions<T> = CustomErrorOptions<T> & {
	field: string;
};

export class ConflictError<T = unknown> extends CustomError<T> {
	public static override readonly type = "Conflict";
	public override readonly type = ConflictError.type;

	public readonly field: string;

	constructor(options: ConflictErrorOptions<T>) {
		const { field, ...customErrOptions } = options;

		super(customErrOptions);

		this.field = field;
	}
}
