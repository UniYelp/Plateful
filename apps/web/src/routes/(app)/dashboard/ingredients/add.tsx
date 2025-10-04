import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(app)/dashboard/ingredients/add')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/(app)/dashboard/ingredients/add"!</div>
}
