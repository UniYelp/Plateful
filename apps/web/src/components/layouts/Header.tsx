import { SignInButton, UserButton, useUser } from "@clerk/clerk-react";
import { Authenticated, AuthLoading, Unauthenticated } from "convex/react";
import { Brand } from "./Brand";
import { Navbar } from "./Navbar";

export function Header() {
	const { user } = useUser();

	return (
		<header className="sticky top-0 z-50 border-border border-b bg-card/50 backdrop-blur-sm">
			<div className="container mx-auto flex items-center justify-between px-4 py-4">
				<Brand />
				<Navbar />
				<div className="flex items-center gap-3">
					<Unauthenticated>
						<SignInButton />
					</Unauthenticated>
					<Authenticated>
						<UserButton />
						<span className="hidden font-medium text-sm sm:block">
							{user?.firstName} {user?.lastName}
						</span>
					</Authenticated>
					<AuthLoading>
						<p>...</p>
					</AuthLoading>
				</div>
			</div>
		</header>
	);
}
