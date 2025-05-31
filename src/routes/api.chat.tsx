import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/chat")({
  component: () => null, // This is an API route, no component needed
});

// This would typically be handled by your backend
// For now, this is just a placeholder to show the structure
// In a real implementation, you'd use Convex actions or mutations 