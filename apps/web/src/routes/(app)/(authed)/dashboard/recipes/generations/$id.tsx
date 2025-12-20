import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/(app)/(authed)/dashboard/recipes/generations/$id',
)({
  component: RouteComponent,
})

function RouteComponent() {
  return <RecipeGenerationPage />
}

function RecipeGenerationPage() {
    return <div>Hello "/(app)/(authed)/dashboard/recipes/generations/$id"!</div>
}