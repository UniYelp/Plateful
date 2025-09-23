import { ConvexReactClient } from "convex/react";
import { ENV } from "./env.config";

export const convexClient = new ConvexReactClient(ENV.VITE_CONVEX_URL);
