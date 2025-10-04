// Mock data for demonstration
export const mockHousehold = {
  id: "1",
  name: "The Smith Family",
  members: [
    { id: "1", name: "John Smith", email: "john@example.com", role: "admin" },
    { id: "2", name: "Jane Smith", email: "jane@example.com", role: "member" },
    { id: "3", name: "Alex Smith", email: "alex@example.com", role: "member" },
  ],
}

export const mockStats = {
  ingredients: 24,
  recipes: 12,
  mealPlans: 3,
  expiringItems: 5,
}

export const mockRecentActivity = [
  { id: "1", type: "recipe", title: "Cooked Spaghetti Carbonara", time: "2 hours ago" },
  { id: "2", type: "ingredient", title: "Added fresh basil", time: "4 hours ago" },
  { id: "3", type: "meal-plan", title: "Created weekly meal plan", time: "1 day ago" },
  { id: "4", type: "recipe", title: "Saved Chicken Tikka Masala", time: "2 days ago" },
]

export const mockExpiringSoon = [
  {
    name: "Fresh basil",
    daysTillExpiry: 2
  },
  {
    name: "Milk",
    daysTillExpiry: 3
  },
  {
    name: "Yogurt",
    daysTillExpiry: 4
  },
]

