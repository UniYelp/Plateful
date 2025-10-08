import { createFileRoute, notFound, rootRouteId, } from '@tanstack/react-router'

export const Route = createFileRoute('/dev')({
  component: RouteComponent,
  beforeLoad: () => {
    if (import.meta.env.DEV) return;

    throw notFound({routeId: rootRouteId})
  }
})

function RouteComponent() {
  return <div>Hello "/dev"!</div>
}
