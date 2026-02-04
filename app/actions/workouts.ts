'use server';

import { db } from "@/lib/db";
import { workouts, weightMeasurements } from "@/lib/db/schema";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function logWorkout(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const activityId = formData.get("activityId") as string;
  
  // Extract known columns
  const durationRaw = formData.get("duration");
  const caloriesRaw = formData.get("calories");
  const startedAtRaw = formData.get("startedAt");
  const notesRaw = formData.get("notes");
  const weightRaw = formData.get("weight");

  const duration = durationRaw ? parseInt(durationRaw as string) : null;
  const calories = caloriesRaw ? parseInt(caloriesRaw as string) : null;
  const startedAt = startedAtRaw ? new Date(startedAtRaw as string) : new Date();
  const description = notesRaw as string | null;

  // Everything else goes into details
  const details: Record<string, unknown> = {};
  const standardFields = ['activityId', 'duration', 'calories', 'startedAt', 'notes', 'weight'];

  formData.forEach((value, key) => {
    if (!standardFields.includes(key) && !key.startsWith('$ACTION_')) {
      details[key] = value;
    }
  });

  // 1. Insert Workout
  await db.insert(workouts).values({
    userId: user.id,
    activityId,
    duration,
    calories,
    startedAt,
    description,
    details,
  });

  // 2. Optional: Insert Weight if provided
  if (weightRaw) {
    const weightInKg = parseFloat(weightRaw as string);
    if (!isNaN(weightInKg)) {
      await db.insert(weightMeasurements).values({
        userId: user.id,
        weight: Math.round(weightInKg * 1000),
        date: startedAt, // Use same date as workout
      });
    }
  }

  revalidatePath("/dashboard");
  revalidatePath("/log/activity");
  revalidatePath("/weight");
  redirect("/dashboard");
}