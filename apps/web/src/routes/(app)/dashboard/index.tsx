import { createFileRoute } from '@tanstack/react-router'
import { useState } from "react"
import {
  ChefHat,
  Users,
  ShoppingCart,
  Calendar,
  Plus,
  LogOut,
  Package,
  BookOpen,
  Clock,
  AlertTriangle,
  Settings,
  User,
  ChevronDown,
  Mail,
} from "lucide-react"
import { useClerk, useUser } from "@clerk/clerk-react"
import { Link, useRouter } from "@tanstack/react-router"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/DropdownMenu"
import { Button } from "@/components/ui/Button"
import { Avatar, AvatarFallback, AvatarInitials } from "@/components/ui/Avatar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/Dialog"
import { Label } from "@/components/ui/Label"
import { Input } from "@/components/ui/Input"
import { mockExpiringSoon, mockHousehold, mockRecentActivity, mockStats } from '@/pages/dashboard/dashboard-page'

export const Route = createFileRoute('/(app)/dashboard/')({
  component: RouteComponent,
  staticData: {
      links: [
        {
          label: "Ingredients",
          to: "."
        },
        {
          label: "Recipes",
          to: "."
        },
        {
          label: "Meal Plan",
          to: "/a",
        },
        {
          label: "Shopping List",
          to: "."
        }
      ],
    },
})

function RouteComponent() {
  return <DashboardPage />
}


export default function DashboardPage() {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const [household, setHousehold] = useState(mockHousehold)
  const [isQuickInviteOpen, setIsQuickInviteOpen] = useState(false)
  const [quickInviteEmail, setQuickInviteEmail] = useState("")

  if (!isLoaded || !user) {
    return <div>Loading...</div>
  }

  const handleQuickInvite = () => {
    console.log("Quick inviting:", quickInviteEmail)
    setQuickInviteEmail("")
    setIsQuickInviteOpen(false)
  }

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
          <h1 className="text-3xl font-bold mb-2">Welcome back, {user.firstName || "Chef"}!</h1>
          <p className="text-muted-foreground">Here's what's happening in your kitchen today.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Package className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{mockStats.ingredients}</p>
                  <p className="text-sm text-muted-foreground">Ingredients</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{mockStats.recipes}</p>
                  <p className="text-sm text-muted-foreground">Recipes</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{mockStats.mealPlans}</p>
                  <p className="text-sm text-muted-foreground">Meal Plans</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-destructive/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-destructive/10 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-destructive" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-destructive">{mockStats.expiringItems}</p>
                  <p className="text-sm text-muted-foreground">Expiring Soon</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Get started with common tasks</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 gap-4">
                  <Button className="h-auto p-4 flex-col gap-2 bg-transparent" variant="outline" asChild>
                    {/* <Link to="/dashboard/ingredients/add">
                      <Plus className="w-6 h-6" />
                      <span>Add Ingredient</span>
                    </Link> */}
                  </Button>

                  <Button className="h-auto p-4 flex-col gap-2 bg-transparent" variant="outline" asChild>
                    {/* <Link to="/dashboard/recipes/create">
                      <ChefHat className="w-6 h-6" />
                      <span>Create Recipe</span>
                    </Link> */}
                  </Button>

                  <Button className="h-auto p-4 flex-col gap-2 bg-transparent" variant="outline" asChild>
                    {/* <Link to="/dashboard/meal-plans/create">
                      <Calendar className="w-6 h-6" />
                      <span>Plan Meals</span>
                    </Link> */}
                  </Button>

                  <Button className="h-auto p-4 flex-col gap-2 bg-transparent" variant="outline" asChild>
                    {/* <Link to="/dashboard/shopping">
                      <ShoppingCart className="w-6 h-6" />
                      <span>Shopping List</span>
                    </Link> */}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Your latest cooking activities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockRecentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                      <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                      {/* TODO: Add to mock data */}
                        {activity.type === "recipe" && <ChefHat className="w-4 h-4 text-primary" />}
                        {activity.type === "ingredient" && <Package className="w-4 h-4 text-primary" />}
                        {activity.type === "meal-plan" && <Calendar className="w-4 h-4 text-primary" />}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{activity.title}</p>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" />
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
                  <Users className="w-5 h-5" />
                  {household.name}
                </CardTitle>
                <CardDescription>Manage your household members</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {household.members.map((member) => (
                    <div key={member.id} className="flex items-center gap-3">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback>
                          <AvatarInitials name={member.name} />
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{member.name}</p>
                        <p className="text-xs text-muted-foreground">{member.email}</p>
                      </div>
                      <Badge variant={member.role === "admin" ? "default" : "secondary"} className="text-xs">
                        {member.role}
                      </Badge>
                    </div>
                  ))}
                </div>

                <div className="mt-4 pt-4 border-t border-border space-y-2">
                  <Dialog open={isQuickInviteOpen} onOpenChange={setIsQuickInviteOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="w-full bg-transparent">
                        <Plus className="w-4 h-4 mr-2" />
                        Invite Member
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Quick Invite</DialogTitle>
                        <DialogDescription>
                          Send a quick invitation to join your household as a member.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="quick-email">Email Address</Label>
                          <Input
                            id="quick-email"
                            type="email"
                            placeholder="Enter email address"
                            value={quickInviteEmail}
                            onChange={(e) => setQuickInviteEmail(e.target.value)}
                          />
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" onClick={() => setIsQuickInviteOpen(false)}>
                            Cancel
                          </Button>
                          <Button onClick={handleQuickInvite} disabled={!quickInviteEmail}>
                            <Mail className="w-4 h-4 mr-2" />
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
                  <AlertTriangle className="w-5 h-5" />
                  Expiring Soon
                </CardTitle>
                <CardDescription>Items that need your attention</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {
                    mockExpiringSoon.map(({name, daysTillExpiry}) => (
                      <div className="flex justify-between items-center text-sm">
                        <span>{name}</span>
                        <Badge variant="destructive" className="text-xs">
                          {daysTillExpiry} days
                        </Badge>
                      </div>
                    ))
                  }
                </div>

                <Button variant="outline" size="sm" className="w-full mt-4 bg-transparent" asChild>
                  {/* <Link to="/dashboard/ingredients">View All</Link> */}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
