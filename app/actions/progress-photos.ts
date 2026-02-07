'use server';

import { db } from "@/lib/db";
import { progressPhotos } from "@/lib/db/schema";
import { createClient } from "@/lib/supabase/server";
import { desc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

const BUCKET_NAME = "progress-photos";

async function uploadFile(supabase: any, userId: string, file: any, label: string) {
  // Check if file exists and is a valid File object with content
  if (!file || typeof file === 'string' || !file.size || file.size === 0) {
    console.log(`uploadFile: Skipping ${label}, no valid file content.`);
    return null;
  }

  const timestamp = Date.now();
  const extension = file.name.split('.').pop() || 'jpg';
  const path = `${userId}/${timestamp}-${label}.${extension}`;

  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(path, file, {
      upsert: true,
      contentType: file.type
    });

  if (error) {
    console.error(`Upload error for ${label}:`, error);
    // Return null instead of throwing to allow other photos to succeed
    return null;
  }

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(path);

  return publicUrl;
}

export async function uploadProgressPhotos(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  // Debug FormData entries
  console.log("FormData entries keys:", Array.from(formData.keys()));

  const front = formData.get("front") as File;
  const back = formData.get("back") as File;
  const sideLeft = formData.get("sideLeft") as File;
  const sideRight = formData.get("sideRight") as File;

  console.log("File objects inspection:", {
    front: front ? { name: front.name, size: front.size, type: front.type } : "null",
    back: back ? { name: back.name, size: back.size, type: back.type } : "null",
    sideLeft: sideLeft ? { name: sideLeft.name, size: sideLeft.size, type: sideLeft.type } : "null",
    sideRight: sideRight ? { name: sideRight.name, size: sideRight.size, type: sideRight.type } : "null",
  });

  try {
    const [frontUrl, backUrl, sideLeftUrl, sideRightUrl] = await Promise.all([
      uploadFile(supabase, user.id, front, "front"),
      uploadFile(supabase, user.id, back, "back"),
      uploadFile(supabase, user.id, sideLeft, "side-left"),
      uploadFile(supabase, user.id, sideRight, "side-right"),
    ]);

    console.log("Upload results:", { frontUrl, backUrl, sideLeftUrl, sideRightUrl });

    if (!frontUrl && !backUrl && !sideLeftUrl && !sideRightUrl) {
      console.warn("No photos were successfully uploaded to storage. Aborting DB insertion.");
      // Redirect anyway so user sees the "empty" state or we can add a search param for error
      redirect("/progress?error=no_photos");
      return;
    }

    const result = await db.insert(progressPhotos).values({
      userId: user.id,
      frontUrl: frontUrl || null,
      backUrl: backUrl || null,
      sideLeftUrl: sideLeftUrl || null,
      sideRightUrl: sideRightUrl || null,
      date: new Date(),
    }).returning();

    console.log("DB Insertion result:", result);

    revalidatePath("/dashboard");
    revalidatePath("/progress");
    revalidatePath("/log/progress");
  } catch (error) {
    console.error("Error saving progress photos:", error);
    // You might want to return an error state here, but for now we throw
    throw error;
  }
  
  redirect("/progress");
}

export async function getLatestProgressPhoto() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const latest = await db.select()
    .from(progressPhotos)
    .where(eq(progressPhotos.userId, user.id))
    .orderBy(desc(progressPhotos.date))
    .limit(1);

  return latest[0] || null;
}

export async function getAllProgressPhotos() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    console.log("getAllProgressPhotos: No user found");
    return [];
  }

  const results = await db.select()
    .from(progressPhotos)
    .where(eq(progressPhotos.userId, user.id))
    .orderBy(desc(progressPhotos.date));
  
  console.log(`getAllProgressPhotos: Found ${results.length} photos for user ${user.id}`);
  return results;
}
