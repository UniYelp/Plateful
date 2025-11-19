export type Variables<T = unknown> = {
	Variables: T;
};

export type Bindings<T extends Variables> = {
	Bindings: T;
};
