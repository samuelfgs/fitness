import { db } from "@/lib/db";
import { activities } from "@/lib/db/schema";
import { unstable_cache } from "next/cache";

export const getCachedActivities = unstable_cache(
  async () => {
    return await db.select().from(activities).orderBy(activities.name);
  },
  ["activities-list"],
  {
    revalidate: 3600, // Cache for 1 hour
    tags: ["activities"],
  }
);
