import { CheckIcon, ChevronsUpDownIcon } from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "@/components/ui/command";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import type { SelectGroup, SelectOption } from "@/types/ui/select";
import { cn } from "@/utils/ui";

type ComboboxProps<T extends string> = {
	value?: NoInfer<T> | undefined;
	className?: string;
	onChange?: (value: NoInfer<T> | undefined) => void;
} & (
	| {
			options: SelectOption<T>[];
			groups?: never;
	  }
	| {
			options?: never;
			groups: SelectGroup<T>[];
	  }
);

const getSelectedMatch = <T extends string>(
	groups: SelectGroup<T>[],
	value?: T,
) => {
	if (!value) return;

	for (const group of groups) {
		const match = group.options.find((option) => option.value === value);
		if (match) return match;
	}
};

export function Combobox<T extends string = string>(props: ComboboxProps<T>) {
	const { options, groups, value, className, onChange } = props;

	const [open, setOpen] = React.useState(false);

	const normalizedGroups = groups ?? [
		{
			label: "",
			options,
		} satisfies SelectGroup<T>,
	];

	const selectedOption = getSelectedMatch(normalizedGroups, value);

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button
					variant="outline"
					role="combobox"
					aria-expanded={open}
					className={cn(
						"flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 font-normal text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1",
						className,
					)}
				>
					{selectedOption?.label || "Select..."}
					<ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-50 p-0">
				<Command>
					<CommandInput placeholder="Search Option..." />
					<CommandList>
						<CommandEmpty>No Options found.</CommandEmpty>
						{normalizedGroups.map((group, idx) => (
							<CommandGroup
								key={group.label || idx}
								heading={group.label || undefined}
							>
								{group.options.map((option) => (
									<CommandItem
										key={option.value}
										value={option.value}
										onSelect={(currentValue) => {
											onChange?.(
												currentValue === value
													? undefined
													: (currentValue as T),
											);

											setOpen(false);
										}}
									>
										<CheckIcon
											className={cn(
												"mr-2 h-4 w-4",
												value === option.value ? "opacity-100" : "opacity-0",
											)}
										/>
										{option.label}
									</CommandItem>
								))}
							</CommandGroup>
						))}
					</CommandList>
				</Command>
			</PopoverContent>
		</Popover>
	);
}
