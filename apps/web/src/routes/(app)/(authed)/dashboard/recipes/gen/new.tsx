import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(app)/(authed)/dashboard/recipes/gen/new")({
  component: RouteComponent,
});

function RouteComponent() {
  return <GenerateNewRecipePage />;
}

function GenerateNewRecipePage() {
  return <div>Hello "/(app)/(authed)/dashboard/recipes/gen/new"!</div>;
}
