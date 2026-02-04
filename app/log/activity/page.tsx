import React from 'react';
import { db } from '@/lib/db';
import { activities } from '@/lib/db/schema';
import LogActivityForm from '@/components/LogActivityForm';

export default async function LogActivityPage() {
  const allActivities = await db.select().from(activities).orderBy(activities.name);

  return <LogActivityForm activities={allActivities} />;
}
