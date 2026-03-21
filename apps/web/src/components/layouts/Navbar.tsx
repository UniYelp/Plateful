import { Link, useMatches } from "@tanstack/react-router";
import { Menu } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@/components/ui/sheet";

export function DesktopNav() {
	const matches = useMatches();

	const links = matches.flatMap(
		(match) => match.staticData.links?.map((linkProps) => linkProps) ?? [],
	);

	return (
		<nav className="hidden items-center gap-6 md:flex">
			{links.map(({ icon, label, ...linkProps }) => (
				<Link
					{...linkProps}
					key={label}
					className="flex items-center text-muted-foreground transition-colors hover:text-foreground"
				>
					{icon}
					{label}
				</Link>
			))}
		</nav>
	);
}

export function MobileNav() {
	const matches = useMatches();
	const [isOpen, setIsOpen] = useState(false);

	const links = matches.flatMap(
		(match) => match.staticData.links?.map((linkProps) => linkProps) ?? [],
	);

	return (
		<nav className="flex md:hidden">
			<Sheet open={isOpen} onOpenChange={setIsOpen}>
				<SheetTrigger asChild>
					<Button variant="ghost" size="icon" aria-label="Menu">
						<Menu className="h-5 w-5" />
					</Button>
				</SheetTrigger>
				<SheetContent side="left" className="w-[300px] sm:w-[400px] sm:max-w-[400px]">
					<SheetHeader>
						<SheetTitle>Menu</SheetTitle>
						<SheetDescription className="sr-only">
							Navigation Links
						</SheetDescription>
					</SheetHeader>
					<div className="mt-8 flex flex-col gap-4">
						{links.map(({ icon, label, ...linkProps }) => (
							<Link
								{...linkProps}
								key={label}
								onClick={() => setIsOpen(false)}
								className="flex items-center gap-3 rounded-md px-3 py-2 font-medium text-lg text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
							>
								{icon}
								{label}
							</Link>
						))}
					</div>
				</SheetContent>
			</Sheet>
		</nav>
	);
}
