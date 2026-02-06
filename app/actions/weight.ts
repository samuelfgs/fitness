'use server';

import { db } from "@/lib/db";
import { weightMeasurements, profiles } from "@/lib/db/schema";
import { createClient } from "@/lib/supabase/server";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function logWeight(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const weightRaw = formData.get("weight");
  if (!weightRaw) return;

  const weightInKg = parseFloat(weightRaw as string);
  const weightInGrams = Math.round(weightInKg * 1000);

  await db.insert(weightMeasurements).values({
    userId: user.id,
    weight: weightInGrams,
    date: new Date(),
  });

  revalidatePath("/dashboard");
  revalidatePath("/weight");
  redirect("/weight");
}

export async function setAsReference(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  // First, unset all other references for this user
  await db.update(weightMeasurements)
    .set({ isReference: false })
    .where(eq(weightMeasurements.userId, user.id));

  // Then set the new one
  await db.update(weightMeasurements)
    .set({ isReference: true })
    .where(eq(weightMeasurements.id, id));

  // Update profile to use 'selected' as the reference type
  await db.update(profiles)
    .set({ weightReference: 'selected' })
    .where(eq(profiles.id, user.id));

  revalidatePath("/dashboard");
  revalidatePath("/weight");
  revalidatePath("/profile");
}
