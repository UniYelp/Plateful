import { client } from "@plateful/api-gateway";
import { ENV } from "./env.config";

export const apiClient = client(ENV.VITE_API_URL);
