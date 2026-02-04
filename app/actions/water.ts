'use server';

import { db } from "@/lib/db";
import { waterLogs } from "@/lib/db/schema";
import { createClient } from "@/lib/supabase/server";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function logWater(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const amountRaw = formData.get("amount");
  if (!amountRaw) return;

  const amount = parseInt(amountRaw as string);

  await db.insert(waterLogs).values({
    userId: user.id,
    amount: amount,
    date: new Date(),
  });

  revalidatePath("/dashboard");
  revalidatePath("/water");
  redirect("/water");
}

export async function deleteWaterLog(id: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
  
    if (!user) {
      throw new Error("Unauthorized");
    }
  
    await db.delete(waterLogs)
        .where(and(
            eq(waterLogs.id, id),
            eq(waterLogs.userId, user.id)
        ));
  
    revalidatePath("/dashboard");
    revalidatePath("/water");
}
