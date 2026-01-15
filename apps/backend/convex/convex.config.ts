import migrations from "@convex-dev/migrations/convex.config";
import { defineApp } from "convex/server";
import nanoBanana from "convex-nano-banana/convex.config";

/**
 * @see {@link https://docs.convex.dev/understanding/best-practices/}
 */

const app = defineApp();
app.use(migrations);

/**
 * @see {@link https://www.convex.dev/components/nano-banana}
 */
app.use(nanoBanana);

// biome-ignore lint/style/noDefaultExport: external
export default app;
