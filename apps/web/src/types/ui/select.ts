import type React from "react";

export type SelectOption<T extends string = string> = {
	value: T;
	label: string;
	icon?: React.JSX.Element;
};

export type SelectGroup<T extends string = string> = {
	label: string;
	options: SelectOption<T>[];
	icon?: React.JSX.Element;
};
