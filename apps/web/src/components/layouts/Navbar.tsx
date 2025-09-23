import { Link, useMatches } from "@tanstack/react-router";
import { useMemo } from "react";

export function Navbar() {
	const matches = useMatches();
	const match = useMemo(() => matches.at(-1), [matches]);

	return (
		<nav className="hidden items-center gap-6 md:flex">
			{match?.staticData.links?.map(({ label, ...linkProps }) => (
				<Link
					{...linkProps}
					key={label}
					className="text-muted-foreground transition-colors hover:text-foreground"
				>
					{label}
				</Link>
			))}
		</nav>
	);
}
