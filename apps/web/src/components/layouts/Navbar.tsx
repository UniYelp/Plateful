import { Link, useMatches } from "@tanstack/react-router";

export function Navbar() {
	const matches = useMatches();

	return (
		<nav className="hidden items-center gap-6 md:flex">
			{matches.flatMap(
				(match) =>
					match.staticData.links?.map(({ label, ...linkProps }) => (
						<Link
							{...linkProps}
							key={label}
							className="text-muted-foreground transition-colors hover:text-foreground"
						>
							{label}
						</Link>
					)) ?? [],
			)}
		</nav>
	);
}
