type CustomErrorOptions<T> = {
	message?: string;
	data: T;
	errorId?: string;
};

export class CustomError<T = unknown> extends Error {
	public static readonly type: string = "Custom";
	public type: string = CustomError.type;

	public readonly data: T;
	public readonly errorId?: string;

	constructor(options: CustomErrorOptions<T>) {
		const { message, data, errorId } = options;

		super(message);

		this.data = data;
		this.errorId = errorId;
	}
}
