import React from 'react';
import { getCachedActivities } from '@/lib/api/activities';
import LogActivityForm from '@/components/LogActivityForm';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function LogActivityPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/');
  }

  const allActivities = await getCachedActivities();

  return <LogActivityForm activities={allActivities} />;
}
