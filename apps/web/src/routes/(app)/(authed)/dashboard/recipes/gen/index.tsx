import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(app)/(authed)/dashboard/recipes/gen/")({
  component: RouteComponent,
});

function RouteComponent() {
  return <RecipeGenerationsPage />;
}

function RecipeGenerationsPage() {
  return <div>Hello "/(app)/(authed)/dashboard/recipes/gen/"!</div>;
}
