import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

/**
 * {@link https://docs.convex.dev/scheduling/cron-jobs}
 */
const crons = cronJobs();

// TODO
// function defineJon() {}
// const jobsConfig = {
//  [NAME]: defineJon((internal) => ({}))
// } as const;

crons.weekly(
	"deleteVacantHouseholds",
	{ dayOfWeek: "monday", hourUTC: 0, minuteUTC: 0 },
	internal.households.deleteVacantHouseholds,
);

export default crons;
