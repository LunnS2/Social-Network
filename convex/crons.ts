import { cronJobs } from "convex/server";
import { api } from "./_generated/api";

const crons = cronJobs();

crons.weekly(
  "Weekly Contest",
  {
    dayOfWeek: "friday",
    hourUTC: 17, // (9:30am Pacific/10:30am Daylight Savings Pacific)
    minuteUTC: 30,
  },
  api.posts.getMostLikedPost
)

export default crons;

// https://docs.convex.dev/api/classes/server.Crons#weekly