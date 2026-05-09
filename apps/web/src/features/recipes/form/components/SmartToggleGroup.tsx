import { useState } from "react";

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/utils/ui";

interface SmartToggleGroupProps<T> {
	items: T[];
	value: string[];
	onValueChange: (value: string[]) => void;
	getValue: (item: T) => string;
	renderItem: (item: T) => React.ReactNode;
	className?: string;
	itemClassName?: string;
	disabled?: boolean;
}

export const SmartToggleGroup = <T,>({
	items,
	value,
	onValueChange,
	getValue,
	renderItem,
	className,
	itemClassName,
	disabled,
}: SmartToggleGroupProps<T>) => {
	const [lastSelectedIndex, setLastSelectedIndex] = useState<number | null>(
		null,
	);

	const handleItemClick = (e: React.MouseEvent, index: number) => {
		if (disabled) return;

		if (e.shiftKey && lastSelectedIndex !== null) {
			// Prevent default Radix behavior to handle range selection ourselves
			e.preventDefault();
			e.stopPropagation();

			const start = Math.min(lastSelectedIndex, index);
			const end = Math.max(lastSelectedIndex, index);
			const rangeValues = items.slice(start, end + 1).map(getValue);

			// If the item at lastSelectedIndex is selected, we select the range.
			// Otherwise, we deselect the range.
			const isSelecting = value.includes(getValue(items[lastSelectedIndex]));

			let newValue: string[];
			if (isSelecting) {
				newValue = Array.from(new Set([...value, ...rangeValues]));
			} else {
				newValue = value.filter((v) => !rangeValues.includes(v));
			}

			onValueChange(newValue);
		}

		setLastSelectedIndex(index);
	};

	return (
		<ToggleGroup
			type="multiple"
			variant="outline"
			value={value}
			onValueChange={onValueChange}
			disabled={disabled}
			className={cn("flex flex-wrap justify-start gap-2.5", className)}
		>
			{items.map((item, index) => {
				const val = getValue(item);
				return (
					<div
						key={val}
						onClickCapture={(e) => handleItemClick(e, index)}
						className="relative"
					>
						<ToggleGroupItem
							value={val}
							className={cn(
								"transition-all duration-200 data-[state=on]:scale-105 data-[state=off]:border-border data-[state=on]:border-primary data-[state=off]:bg-background data-[state=on]:bg-primary/10 data-[state=on]:text-primary data-[state=on]:shadow-sm data-[state=off]:hover:border-primary/50 data-[state=off]:hover:bg-muted data-[state=off]:hover:text-black",
								itemClassName,
							)}
							disabled={disabled}
						>
							{renderItem(item)}
						</ToggleGroupItem>
					</div>
				);
			})}
		</ToggleGroup>
	);
};
