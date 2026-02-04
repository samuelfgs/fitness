'use server';

import { db } from "@/lib/db";
import { weightMeasurements } from "@/lib/db/schema";
import { createClient } from "@/lib/supabase/server";
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
