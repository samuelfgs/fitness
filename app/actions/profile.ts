"use server";

import { db } from "@/lib/db";
import { profiles } from "@/lib/db/schema";
import { createClient } from "@/lib/supabase/server";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function updateProfile(data: {
  age?: number;
  height?: number;
  desiredWeight?: number;
  weightReference?: string;
  kcalGoal?: number;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const existingProfile = await db
    .select()
    .from(profiles)
    .where(eq(profiles.id, user.id))
    .limit(1);

  if (existingProfile.length > 0) {
    await db
      .update(profiles)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(profiles.id, user.id));
  } else {
    await db.insert(profiles).values({
      id: user.id,
      ...data,
      updatedAt: new Date(),
    });
  }

  revalidatePath("/dashboard");
  revalidatePath("/profile");
}

export async function getProfile() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const profile = await db
    .select()
    .from(profiles)
    .where(eq(profiles.id, user.id))
    .limit(1);

  return profile.length > 0 ? profile[0] : null;
}
