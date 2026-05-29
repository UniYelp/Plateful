import { Link, type LinkComponentProps } from "@tanstack/react-router";
import { Menu } from "lucide-react";
import { useState } from "react";

import { useIsRouteActive } from "&/router/hooks/is-route-active";
import { useAggregatedMatch } from "&/router/hooks/use-aggregated-matches";
import { Button } from "@/components/ui/button";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/utils/ui";
import { AIStatusIndicator } from "./AIStatus";
import { NotificationStatus } from "./NotificationStatus";

export type NavItem = LinkComponentProps & {
	icon?: React.JSX.Element;
	label: string;
};

function NavbarItem({ icon, label, ...props }: NavItem) {
	const isActive = useIsRouteActive(props);

	return (
		<Link
			{...props}
			className={cn(
				"flex items-center text-muted-foreground transition-colors hover:text-foreground",
				isActive && "font-medium text-foreground",
				props.className,
			)}
		>
			{icon}
			{label}
		</Link>
	);
}

export function DesktopNav() {
	const navItems = useAggregatedMatch((data) => data.navbar?.items);

	return (
		<nav className="hidden items-center gap-6 md:flex">
			{navItems.map((linkProps) => (
				<NavbarItem {...linkProps} key={linkProps.label} />
			))}
		</nav>
	);
}

export function MobileNav() {
	const [isOpen, setIsOpen] = useState(false);

	const navItems = useAggregatedMatch((data) => data.navbar?.items);

	if (!navItems.length) return null;

	return (
		<nav className="flex md:hidden">
			<Sheet open={isOpen} onOpenChange={setIsOpen}>
				<SheetTrigger asChild>
					<Button variant="ghost" size="icon" aria-label="Menu">
						<Menu className="h-5 w-5" />
					</Button>
				</SheetTrigger>
				<SheetContent
					side="left"
					className="w-[300px] sm:w-[400px] sm:max-w-[400px]"
				>
					<SheetHeader>
						<SheetTitle>Menu</SheetTitle>
						<SheetDescription className="sr-only">
							Navigation Links
						</SheetDescription>
					</SheetHeader>
					<div className="mt-8 flex flex-col gap-4">
						{navItems.map((linkProps) => (
							<NavbarItem
								{...linkProps}
								key={linkProps.label}
								onClick={() => setIsOpen(false)}
							/>
						))}

						<div className="mt-6 flex flex-col gap-4 border-t pt-6">
							<span className="px-2 font-semibold text-muted-foreground text-xs uppercase tracking-wider">
								Settings & Status
							</span>
							<div className="flex flex-col gap-2">
								<AIStatusIndicator variant="mobile" />
								<NotificationStatus variant="mobile" />
							</div>
						</div>
					</div>
				</SheetContent>
			</Sheet>
		</nav>
	);
}
