import { createFileRoute, Link } from "@tanstack/react-router";
import {
	Calendar,
	Check,
	Package,
	Plus,
	ShoppingCart,
	X,
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
import { Checkbox } from "@/components/ui/Checkbox";
import { Input } from "@/components/ui/Input";
import { categories, mockShoppingItems, priorityColors, sourceLabels } from "@/pages/dashboard/shopping-list";

export const Route = createFileRoute("/(app)/dashboard/shopping-list/")({
	component: RouteComponent,
});

function RouteComponent() {
	return <ShoppingPage/>;
}


export default function ShoppingPage() {
	const [selectedCategory, setSelectedCategory] = useState("all");
	const [shoppingItems, setShoppingItems] = useState(mockShoppingItems);
	const [newItem, setNewItem] = useState("");

	const filteredItems = shoppingItems.filter((item) => {
		return selectedCategory === "all" || item.category === selectedCategory;
	});

	const toggleItem = (itemId: string) => {
		setShoppingItems((prev) =>
			prev.map((item) =>
				item.id === itemId ? { ...item, checked: !item.checked } : item,
			),
		);
	};

	const removeItem = (itemId: string) => {
		setShoppingItems((prev) => prev.filter((item) => item.id !== itemId));
	};

	const addItem = () => {
		if (!newItem.trim()) return;

		const newShoppingItem = {
			id: Date.now().toString(),
			name: newItem,
			amount: "1",
			category: "other",
			source: "manual" as const,
			sourceName: "Added manually",
			priority: "low" as const,
			checked: false,
			estimatedPrice: 0,
		};

		setShoppingItems((prev) => [...prev, newShoppingItem]);
		setNewItem("");
	};

	const checkedItems = shoppingItems.filter((item) => item.checked);
	const uncheckedItems = shoppingItems.filter((item) => !item.checked);
	const totalEstimated = uncheckedItems.reduce(
		(sum, item) => sum + item.estimatedPrice,
		0,
	);

	return (
		<div className="min-h-screen bg-background">
			<div className="container mx-auto px-4 py-8">
				{/* Page Header */}
				<div className="mb-8 flex items-center justify-between">
					<div>
						<h1 className="mb-2 font-bold text-3xl">Shopping List</h1>
						<p className="text-muted-foreground">
							Keep track of ingredients you need to buy
						</p>
					</div>
					<div className="text-right">
						<p className="font-bold text-2xl">${totalEstimated.toFixed(2)}</p>
						<p className="text-muted-foreground text-sm">Estimated total</p>
					</div>
				</div>

				{/* Stats Cards */}
				<div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
					<Card>
						<CardContent className="p-4">
							<div className="font-bold text-2xl">{uncheckedItems.length}</div>
							<p className="text-muted-foreground text-sm">Items to buy</p>
						</CardContent>
					</Card>
					<Card>
						<CardContent className="p-4">
							<div className="font-bold text-2xl text-green-600">
								{checkedItems.length}
							</div>
							<p className="text-muted-foreground text-sm">Items bought</p>
						</CardContent>
					</Card>
					<Card>
						<CardContent className="p-4">
							<div className="font-bold text-2xl text-red-600">
								{
									uncheckedItems.filter((item) => item.priority === "high")
										.length
								}
							</div>
							<p className="text-muted-foreground text-sm">High priority</p>
						</CardContent>
					</Card>
					<Card>
						<CardContent className="p-4">
							<div className="font-bold text-2xl">
								{new Set(uncheckedItems.map((item) => item.category)).size}
							</div>
							<p className="text-muted-foreground text-sm">Categories</p>
						</CardContent>
					</Card>
				</div>

				{/* Add Item */}
				<Card className="mb-6">
					<CardContent className="p-4">
						<div className="flex gap-2">
							<Input
								placeholder="Add new item..."
								value={newItem}
								onChange={(e) => setNewItem(e.target.value)}
								onKeyPress={(e) => e.key === "Enter" && addItem()}
								className="flex-1"
							/>
							<Button onClick={addItem}>
								<Plus className="mr-2 h-4 w-4" />
								Add
							</Button>
						</div>
					</CardContent>
				</Card>

				{/* Category Filter */}
				<div className="mb-6 flex gap-2 overflow-x-auto">
					{categories.map((category) => (
						<Button
							key={category}
							variant={selectedCategory === category ? "default" : "outline"}
							size="sm"
							onClick={() => setSelectedCategory(category)}
							className="whitespace-nowrap"
						>
							{category.charAt(0).toUpperCase() + category.slice(1)}
						</Button>
					))}
				</div>

				<div className="grid gap-6 lg:grid-cols-3">
					{/* Shopping Items */}
					<div className="lg:col-span-2">
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<ShoppingCart className="h-5 w-5" />
									Shopping Items
								</CardTitle>
								<CardDescription>
									{uncheckedItems.length} items remaining •{" "}
									{checkedItems.length} completed
								</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="space-y-3">
									{/* Unchecked Items */}
									{filteredItems
										.filter((item) => !item.checked)
										.map((item) => (
											<div
												key={item.id}
												className={`flex items-center gap-3 rounded-lg border-l-4 bg-card p-3 ${priorityColors[item.priority]}`}
											>
												<Checkbox
													checked={item.checked}
													onCheckedChange={() => toggleItem(item.id)}
												/>
												<div className="flex-1">
													<div className="mb-1 flex items-center gap-2">
														<span className="font-medium">{item.name}</span>
														<Badge variant="outline" className="text-xs">
															{item.amount}
														</Badge>
														<Badge className={sourceLabels[item.source].color}>
															{sourceLabels[item.source].label}
														</Badge>
													</div>
													<p className="text-muted-foreground text-sm">
														{item.sourceName}
													</p>
													{item.estimatedPrice > 0 && (
														<p className="font-medium text-green-600 text-sm">
															${item.estimatedPrice.toFixed(2)}
														</p>
													)}
												</div>
												<Button
													variant="ghost"
													size="sm"
													onClick={() => removeItem(item.id)}
												>
													<X className="h-4 w-4" />
												</Button>
											</div>
										))}

									{/* Checked Items */}
									{filteredItems.filter((item) => item.checked).length > 0 && (
										<>
											<div className="mt-6 border-t pt-4">
												<h4 className="mb-3 flex items-center gap-2 font-medium text-muted-foreground">
													<Check className="h-4 w-4" />
													Completed ({checkedItems.length})
												</h4>
											</div>
											{filteredItems
												.filter((item) => item.checked)
												.map((item) => (
													<div
														key={item.id}
														className="flex items-center gap-3 rounded-lg bg-muted/50 p-3 opacity-60"
													>
														<Checkbox
															checked={item.checked}
															onCheckedChange={() => toggleItem(item.id)}
														/>
														<div className="flex-1">
															<div className="mb-1 flex items-center gap-2">
																<span className="font-medium line-through">
																	{item.name}
																</span>
																<Badge variant="outline" className="text-xs">
																	{item.amount}
																</Badge>
															</div>
															<p className="text-muted-foreground text-sm">
																{item.sourceName}
															</p>
														</div>
														<Button
															variant="ghost"
															size="sm"
															onClick={() => removeItem(item.id)}
														>
															<X className="h-4 w-4" />
														</Button>
													</div>
												))}
										</>
									)}

									{filteredItems.length === 0 && (
										<div className="py-8 text-center">
											<Package className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
											<h3 className="mb-2 font-semibold text-lg">
												No items in this category
											</h3>
											<p className="text-muted-foreground">
												Try selecting a different category or add new items
											</p>
										</div>
									)}
								</div>
							</CardContent>
						</Card>
					</div>

					{/* Shopping Summary */}
					<div>
						<Card className="mb-6">
							<CardHeader>
								<CardTitle>Shopping Summary</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="space-y-4">
									<div className="flex justify-between">
										<span>Items to buy:</span>
										<span className="font-medium">{uncheckedItems.length}</span>
									</div>
									<div className="flex justify-between">
										<span>Estimated total:</span>
										<span className="font-medium">
											${totalEstimated.toFixed(2)}
										</span>
									</div>
									<div className="border-t pt-4">
										<div className="space-y-2">
											<div className="flex justify-between text-sm">
												<span>High priority:</span>
												<span className="text-red-600">
													{
														uncheckedItems.filter(
															(item) => item.priority === "high",
														).length
													}
												</span>
											</div>
											<div className="flex justify-between text-sm">
												<span>Medium priority:</span>
												<span className="text-yellow-600">
													{
														uncheckedItems.filter(
															(item) => item.priority === "medium",
														).length
													}
												</span>
											</div>
											<div className="flex justify-between text-sm">
												<span>Low priority:</span>
												<span className="text-green-600">
													{
														uncheckedItems.filter(
															(item) => item.priority === "low",
														).length
													}
												</span>
											</div>
										</div>
									</div>
								</div>
							</CardContent>
						</Card>

						{/* Quick Actions */}
						<Card>
							<CardHeader>
								<CardTitle>Quick Actions</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="space-y-3">
									<Button
										variant="outline"
										className="w-full justify-start bg-transparent"
										asChild
									>
										<Link to="/dashboard/meal-plans">
											<Calendar className="mr-2 h-4 w-4" />
											View Meal Plans
										</Link>
									</Button>
									<Button
										variant="outline"
										className="w-full justify-start bg-transparent"
										asChild
									>
										<Link to="/dashboard/ingredients">
											<Package className="mr-2 h-4 w-4" />
											Check Ingredients
										</Link>
									</Button>
									<Button
										variant="outline"
										className="w-full justify-start bg-transparent"
										onClick={() => {
											const completedItems = checkedItems
												.map((item) => item.name)
												.join(", ");
											if (completedItems) {
												alert(`Completed items: ${completedItems}`);
											}
										}}
									>
										<Check className="mr-2 h-4 w-4" />
										Mark All Done
									</Button>
								</div>
							</CardContent>
						</Card>
					</div>
				</div>
			</div>
		</div>
	);
}
