'use server';

import { db } from "@/lib/db";
import { stepsLogs } from "@/lib/db/schema";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function logSteps(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const countRaw = formData.get("count");
  if (!countRaw) return;

  const count = parseInt(countRaw as string);

  await db.insert(stepsLogs).values({
    userId: user.id,
    count: count,
    date: new Date(),
  });

  revalidatePath("/dashboard");
  // Assuming we might have a steps page later, but for now redirect to dashboard
  redirect("/dashboard");
}