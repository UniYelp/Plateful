import migrations from "@convex-dev/migrations/convex.config";
import { defineApp } from "convex/server";

/**
 * @see {@link https://docs.convex.dev/understanding/best-practices/}
 */

const app = defineApp();
app.use(migrations);

// biome-ignore lint/style/noDefaultExport: external
export default app;
