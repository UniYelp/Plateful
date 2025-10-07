// Mock shopping list data
export const mockShoppingItems = [
    {
        id: "1",
        name: "Chicken Breast",
        amount: "1 lb",
        category: "meat",
        source: "meal-plan",
        sourceName: "Healthy Week - Grilled Chicken",
        priority: "high",
        checked: false,
        estimatedPrice: 8.99,
    },
    {
        id: "2",
        name: "Pancetta",
        amount: "150g",
        category: "meat",
        source: "recipe",
        sourceName: "Spaghetti Carbonara",
        priority: "medium",
        checked: false,
        estimatedPrice: 6.5,
    },
    {
        id: "3",
        name: "Fresh Basil",
        amount: "1 bunch",
        category: "herbs",
        source: "expiring",
        sourceName: "Expiring in 2 days",
        priority: "high",
        checked: true,
        estimatedPrice: 2.99,
    },
    {
        id: "4",
        name: "Bell Peppers",
        amount: "3 pieces",
        category: "vegetables",
        source: "recipe",
        sourceName: "Beef Stir Fry",
        priority: "medium",
        checked: false,
        estimatedPrice: 4.5,
    },
    {
        id: "5",
        name: "Greek Yogurt",
        amount: "500g",
        category: "dairy",
        source: "low-stock",
        sourceName: "Running low",
        priority: "low",
        checked: false,
        estimatedPrice: 3.99,
    },
    {
        id: "6",
        name: "Olive Oil",
        amount: "500ml",
        category: "oils",
        source: "manual",
        sourceName: "Added manually",
        priority: "low",
        checked: false,
        estimatedPrice: 7.99,
    },
];

export const categories = [
    "all",
    "meat",
    "vegetables",
    "dairy",
    "herbs",
    "oils",
    "grains",
    "other",
];

export const sourceLabels = {
    "meal-plan": { label: "Meal Plan", color: "bg-blue-100 text-blue-800" },
    recipe: { label: "Recipe", color: "bg-green-100 text-green-800" },
    expiring: { label: "Expiring", color: "bg-red-100 text-red-800" },
    "low-stock": { label: "Low Stock", color: "bg-yellow-100 text-yellow-800" },
    manual: { label: "Manual", color: "bg-gray-100 text-gray-800" },
};

export const priorityColors = {
    high: "border-l-red-500",
    medium: "border-l-yellow-500",
    low: "border-l-green-500",
};