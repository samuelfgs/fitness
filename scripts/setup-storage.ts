
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config({ path: '.env.local' });
dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables.");
  console.log("Make sure you have the Service Role Key from Supabase Dashboard -> Project Settings -> API");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupStorage() {
  console.log("Setting up Supabase Storage for Progress Photos...");

  const BUCKET_NAME = "progress-photos";

  // 1. Create the bucket
  const { data: bucket, error: bucketError } = await supabase.storage.createBucket(BUCKET_NAME, {
    public: true, // Making it public so URLs work directly, but we'll restrict uploads
    fileSizeLimit: 5242880, // 5MB
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp']
  });

  if (bucketError) {
    if (bucketError.message === 'Bucket already exists') {
      console.log("Bucket 'progress-photos' already exists.");
    } else {
      console.error("Error creating bucket:", bucketError);
      return;
    }
  } else {
    console.log("Bucket 'progress-photos' created successfully.");
  }

  console.log("
IMPORTANT: Please ensure the following RLS policies are set for the 'progress-photos' bucket in the Supabase Dashboard:");
  console.log("1. SELECT: Allow 'public' or 'authenticated' users (since we set public: true).");
  console.log("2. INSERT: Allow 'authenticated' where 'auth.uid() = owner_id' (or matching folder name).");
  console.log("
You can do this in Storage -> Policies -> progress-photos.");
}

setupStorage();
