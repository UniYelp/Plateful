import { createFileRoute, Link } from '@tanstack/react-router'
import { useState } from "react"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Card, CardContent } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { categories, mockIngredients } from '@/pages/dashboard/ingredients'
import { Edit, Package, Plus, Search, Trash2 } from 'lucide-react'

export const Route = createFileRoute('/(app)/dashboard/ingredients/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <IngredientsPage/>
}


export default function IngredientsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [ingredients] = useState(mockIngredients)


  const filteredIngredients = ingredients.filter((ingredient) => {
    const matchesSearch =
      ingredient.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ingredient.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "all" || ingredient.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const getExpiryStatus = (expiryDate: string) => {
    const today = new Date()
    const expiry = new Date(expiryDate)
    const diffTime = expiry.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays < 0) return { status: "expired", color: "destructive", text: "Expired" }
    if (diffDays <= 3) return { status: "expiring", color: "destructive", text: `${diffDays} days` }
    if (diffDays <= 7) return { status: "warning", color: "secondary", text: `${diffDays} days` }
    return { status: "good", color: "outline", text: `${diffDays} days` }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Ingredients</h1>
            <p className="text-muted-foreground">Manage your kitchen inventory</p>
          </div>
          <Button asChild>
            <Link to="./add">
              <Plus className="w-4 h-4 mr-2" />
              Add Ingredient
            </Link>
          </Button>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search ingredients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto">
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
        </div>

        {/* Ingredients Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredIngredients.map((ingredient) => {
            const expiryStatus = getExpiryStatus(ingredient.expiryDate)
            return (
              <Card key={ingredient.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3 mb-3">
                    <img
                      src={ingredient.image || "/placeholder.svg"}
                      alt={ingredient.title}
                      className="w-16 h-16 rounded-lg object-cover bg-muted"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate">{ingredient.title}</h3>
                      <p className="text-sm text-muted-foreground truncate">{ingredient.description}</p>
                      <p className="text-sm font-medium mt-1">{ingredient.amount}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Added:</span>
                      <span>{new Date(ingredient.addedDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Expires:</span>
                      <Badge variant={expiryStatus.color as any} className="text-xs">
                        {expiryStatus.status === "expired" ? "Expired" : expiryStatus.text}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4">
                    <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                      <Edit className="w-3 h-3 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-destructive hover:text-destructive bg-transparent"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {filteredIngredients.length === 0 && (
          <div className="text-center py-12">
            <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No ingredients found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || selectedCategory !== "all"
                ? "Try adjusting your search or filter"
                : "Start by adding your first ingredient"}
            </p>
            <Button asChild>
              <Link to="./add">
                <Plus className="w-4 h-4 mr-2" />
                Add Ingredient
              </Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
