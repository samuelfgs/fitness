import React from 'react';
import { db } from '@/lib/db';
import { activities } from '@/lib/db/schema';
import LogActivityForm from '@/components/LogActivityForm';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function LogActivityPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/');
  }

  const allActivities = await db.select().from(activities).orderBy(activities.name);

  return <LogActivityForm activities={allActivities} />;
}
