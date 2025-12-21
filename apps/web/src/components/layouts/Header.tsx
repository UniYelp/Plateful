import { SignInButton, UserButton } from "@clerk/clerk-react";
import { Link } from "@tanstack/react-router";
import { Authenticated, AuthLoading, Unauthenticated } from "convex/react";

import { Brand } from "./Brand";
import { Navbar } from "./Navbar";

export function Header() {
	return (
		<header className="sticky top-0 z-50 border-border border-b bg-card/50 backdrop-blur-sm">
			<div className="container mx-auto flex items-center justify-between px-4 py-4">
				<Link to="/dashboard">
					<Brand />
				</Link>
				<Navbar />
				<div className="flex min-w-7 items-center gap-3">
					<Unauthenticated>
						<SignInButton />
					</Unauthenticated>
					<Authenticated>
						<UserButton />
					</Authenticated>
					<AuthLoading>
						<p>...</p>
					</AuthLoading>
				</div>
			</div>
		</header>
	);
}
