import { cronJobs } from "convex/server";
import { api } from "./_generated/api";

const crons = cronJobs();

crons.weekly(
  "Weekly Contest",
  {
    dayOfWeek: "friday",
    hourUTC: 14,
    minuteUTC: 0,
  },
  api.posts.wallOfFamePickingProcess
)

export default crons;

// 14:00–16:00 UTC: Morning Americas (6:00–10:00 AM),
// Afternoon Europe/Africa (2:00–6:00 PM),
// Evening Asia (10:00 PM–12:00 AM),
// Late Night Australia (12:00–2:00 AM next day)

// https://docs.convex.dev/api/classes/server.Crons#weekly