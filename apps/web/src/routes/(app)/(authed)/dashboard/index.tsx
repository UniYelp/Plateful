import { useUser } from "@clerk/clerk-react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
	AlertTriangle,
	BookOpen,
	Calendar,
	ChefHat,
	Clock,
	Mail,
	Package,
	Plus,
	ShoppingCart,
	Users,
} from "lucide-react";
import { useState } from "react";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/Card";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/Dialog";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import {
	mockExpiringSoon,
	mockHousehold,
	mockRecentActivity,
	mockStats,
} from "@/pages/dashboard/dashboard-page";

export const Route = createFileRoute("/(app)/(authed)/dashboard/")({
	component: RouteComponent,
	staticData: {
		links: [
			{
				label: "Ingredients",
				to: "/dashboard/ingredients",
			},
			{
				label: "Recipes",
				to: "/dashboard/recipes",
			},
			{
				label: "Meal Plan",
				to: "/dashboard/meal-plans",
			},
			{
				label: "Shopping List",
				to: "/dashboard/shopping-list",
			},
		],
	},
});

function RouteComponent() {
	return <DashboardPage />;
}

function DashboardPage() {
	const { user, isLoaded } = useUser();
	const [household] = useState(mockHousehold);
	const [isQuickInviteOpen, setIsQuickInviteOpen] = useState(false);
	const [quickInviteEmail, setQuickInviteEmail] = useState("");

	if (!isLoaded || !user) {
		return <div>Loading...</div>;
	}

	const handleQuickInvite = () => {
		console.log("Quick inviting:", quickInviteEmail);
		setQuickInviteEmail("");
		setIsQuickInviteOpen(false);
	};

	return (
		<div className="min-h-screen bg-background">
			{/* Header */}
			{/* <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 h-auto p-2">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback>
                      <AvatarInitials name={user.fullName || user.firstName || "User"} />
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden sm:block text-sm font-medium">{user.fullName || user.firstName}</span>
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/profile">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/profile">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/household">
                    <Users className="mr-2 h-4 w-4" />
                    <span>Manage Household</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header> */}

			<div className="container mx-auto px-4 py-8">
				{/* Welcome Section */}
				<div className="mb-8">
					<h1 className="mb-2 font-bold text-3xl">
						Welcome back, {user.firstName || "Chef"}!
					</h1>
					<p className="text-muted-foreground">
						Here's what's happening in your kitchen today.
					</p>
				</div>

				{/* Stats Cards */}
				<div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
					<Card>
						<CardContent className="p-4">
							<div className="flex items-center gap-3">
								<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
									<Package className="h-5 w-5 text-primary" />
								</div>
								<div>
									<p className="font-bold text-2xl">{mockStats.ingredients}</p>
									<p className="text-muted-foreground text-sm">Ingredients</p>
								</div>
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardContent className="p-4">
							<div className="flex items-center gap-3">
								<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
									<BookOpen className="h-5 w-5 text-primary" />
								</div>
								<div>
									<p className="font-bold text-2xl">{mockStats.recipes}</p>
									<p className="text-muted-foreground text-sm">Recipes</p>
								</div>
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardContent className="p-4">
							<div className="flex items-center gap-3">
								<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
									<Calendar className="h-5 w-5 text-primary" />
								</div>
								<div>
									<p className="font-bold text-2xl">{mockStats.mealPlans}</p>
									<p className="text-muted-foreground text-sm">Meal Plans</p>
								</div>
							</div>
						</CardContent>
					</Card>

					<Card className="border-destructive/50">
						<CardContent className="p-4">
							<div className="flex items-center gap-3">
								<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/10">
									<AlertTriangle className="h-5 w-5 text-destructive" />
								</div>
								<div>
									<p className="font-bold text-2xl text-destructive">
										{mockStats.expiringItems}
									</p>
									<p className="text-muted-foreground text-sm">Expiring Soon</p>
								</div>
							</div>
						</CardContent>
					</Card>
				</div>

				<div className="grid gap-8 lg:grid-cols-3">
					{/* Quick Actions */}
					<div className="lg:col-span-2">
						<Card>
							<CardHeader>
								<CardTitle>Quick Actions</CardTitle>
								<CardDescription>Get started with common tasks</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="grid gap-4 sm:grid-cols-2">
									<Button
										className="h-auto flex-col gap-2 bg-transparent p-4"
										variant="outline"
										asChild
									>
										<Link to="/dashboard/ingredients/add">
											<Plus className="h-6 w-6" />
											<span>Add Ingredient</span>
										</Link>
									</Button>

									<Button
										className="h-auto flex-col gap-2 bg-transparent p-4"
										variant="outline"
										asChild
									>
										<Link to="/dashboard/recipes/create">
											<ChefHat className="h-6 w-6" />
											<span>Create Recipe</span>
										</Link>
									</Button>

									<Button
										className="h-auto flex-col gap-2 bg-transparent p-4"
										variant="outline"
										asChild
									>
										<Link to="/dashboard/meal-plans/create">
											<Calendar className="h-6 w-6" />
											<span>Plan Meals</span>
										</Link>
									</Button>

									<Button
										className="h-auto flex-col gap-2 bg-transparent p-4"
										variant="outline"
										asChild
									>
										<Link to="/dashboard/shopping-list">
											<ShoppingCart className="h-6 w-6" />
											<span>Shopping List</span>
										</Link>
									</Button>
								</div>
							</CardContent>
						</Card>

						{/* Recent Activity */}
						<Card className="mt-6">
							<CardHeader>
								<CardTitle>Recent Activity</CardTitle>
								<CardDescription>
									Your latest cooking activities
								</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="space-y-4">
									{mockRecentActivity.map((activity) => (
										<div
											key={activity.id}
											className="flex items-center gap-3 rounded-lg bg-muted/50 p-3"
										>
											<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
												{/* TODO: Add to mock data */}
												{activity.type === "recipe" && (
													<ChefHat className="h-4 w-4 text-primary" />
												)}
												{activity.type === "ingredient" && (
													<Package className="h-4 w-4 text-primary" />
												)}
												{activity.type === "meal-plan" && (
													<Calendar className="h-4 w-4 text-primary" />
												)}
											</div>
											<div className="flex-1">
												<p className="font-medium">{activity.title}</p>
												<p className="flex items-center gap-1 text-muted-foreground text-sm">
													<Clock className="h-3 w-3" />
													{activity.time}
												</p>
											</div>
										</div>
									))}
								</div>
							</CardContent>
						</Card>
					</div>

					{/* Household Management */}
					<div>
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<Users className="h-5 w-5" />
									{household.name}
								</CardTitle>
								<CardDescription>Manage your household members</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="space-y-3">
									{household.members.map((member) => (
										<div key={member.id} className="flex items-center gap-3">
											{/* <Avatar className="h-8 w-8">
												<AvatarFallback>
													<AvatarInitials name={member.name} />
												</AvatarFallback>
											</Avatar> */}
											<div className="flex-1">
												<p className="font-medium text-sm">{member.name}</p>
												<p className="text-muted-foreground text-xs">
													{member.email}
												</p>
											</div>
											<Badge
												variant={
													member.role === "admin" ? "default" : "secondary"
												}
												className="text-xs"
											>
												{member.role}
											</Badge>
										</div>
									))}
								</div>

								<div className="mt-4 space-y-2 border-border border-t pt-4">
									<Dialog
										open={isQuickInviteOpen}
										onOpenChange={setIsQuickInviteOpen}
									>
										<DialogTrigger asChild>
											<Button
												variant="outline"
												size="sm"
												className="w-full bg-transparent"
											>
												<Plus className="mr-2 h-4 w-4" />
												Invite Member
											</Button>
										</DialogTrigger>
										<DialogContent>
											<DialogHeader>
												<DialogTitle>Quick Invite</DialogTitle>
												<DialogDescription>
													Send a quick invitation to join your household as a
													member.
												</DialogDescription>
											</DialogHeader>
											<div className="space-y-4">
												<div>
													<Label htmlFor="quick-email">Email Address</Label>
													<Input
														// id="quick-email"
														type="email"
														placeholder="Enter email address"
														value={quickInviteEmail}
														onChange={(e) =>
															setQuickInviteEmail(e.target.value)
														}
													/>
												</div>
												<div className="flex justify-end gap-2">
													<Button
														variant="outline"
														onClick={() => setIsQuickInviteOpen(false)}
													>
														Cancel
													</Button>
													<Button
														onClick={handleQuickInvite}
														disabled={!quickInviteEmail}
													>
														<Mail className="mr-2 h-4 w-4" />
														Send Invite
													</Button>
												</div>
											</div>
										</DialogContent>
									</Dialog>

									<Button variant="ghost" size="sm" className="w-full" asChild>
										{/* <Link to="/household">
                      <Users className="w-4 h-4 mr-2" />
                      Manage Household
                    </Link> */}
									</Button>
								</div>
							</CardContent>
						</Card>

						{/* Expiring Items Alert */}
						<Card className="mt-6 border-destructive/50">
							<CardHeader>
								<CardTitle className="flex items-center gap-2 text-destructive">
									<AlertTriangle className="h-5 w-5" />
									Expiring Soon
								</CardTitle>
								<CardDescription>
									Items that need your attention
								</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="space-y-2">
									{mockExpiringSoon.map(({ name, daysTillExpiry }) => (
										<div
											key={`expiring-ingredient-${name}`}
											className="flex items-center justify-between text-sm"
										>
											<span>{name}</span>
											<Badge variant="destructive" className="text-xs">
												{daysTillExpiry} days
											</Badge>
										</div>
									))}
								</div>

								<Button
									variant="outline"
									size="sm"
									className="mt-4 w-full bg-transparent"
									asChild
								>
									<Link to="/dashboard/ingredients">View All</Link>
								</Button>
							</CardContent>
						</Card>
					</div>
				</div>
			</div>
		</div>
	);
}
