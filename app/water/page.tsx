import React from 'react';
import { ArrowLeft, Plus, Droplets } from 'lucide-react';
import Link from 'next/link';
import { db } from '@/lib/db';
import { waterLogs } from '@/lib/db/schema';
import { desc, eq, sql } from 'drizzle-orm';
import { createClient } from '@/lib/supabase/server';

import { redirect } from 'next/navigation';

export default async function WaterPage() {
  const supabase = await createClient();
  
  if (!supabase) {
    return redirect("/");
  }

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/");
  }

  if (!db || typeof db.select !== 'function') {
    throw new Error("Service unavailable");
  }

  const logs = await db.select()
    .from(waterLogs)
    .where(eq(waterLogs.userId, user.id))
    .orderBy(desc(waterLogs.date));

  // Calculate today's total
  const today = new Date().toDateString();
  const todayTotal = logs
    .filter(log => new Date(log.date).toDateString() === today)
    .reduce((acc, log) => acc + log.amount, 0);

  return (
    <div className="min-h-screen flex flex-col bg-background pb-32">
      <div className="px-6 py-6 border-b border-border flex items-center justify-between">
        <Link href="/dashboard" className="p-2 -ml-2 text-foreground bg-muted rounded-xl hover:bg-muted/80 transition-colors">
          <ArrowLeft size={24} />
        </Link>
        <h1 className="text-xl font-black text-foreground tracking-tight">Hidratação</h1>
        <Link href="/log/water" className="p-2 -mr-2 text-primary bg-primary/10 rounded-xl hover:bg-primary/20 transition-colors">
          <Plus size={24} />
        </Link>
      </div>

      <div className="flex-1 p-6">
        {/* Today's Summary */}
        <div className="bg-primary/5 border border-primary/20 rounded-[2rem] p-6 mb-8 flex items-center justify-between">
            <div>
                <p className="text-muted-foreground font-bold text-xs uppercase tracking-widest mb-1">Total Hoje</p>
                <p className="text-4xl font-black text-primary">{(todayTotal / 1000).toFixed(1)}<span className="text-lg text-muted-foreground ml-1">L</span></p>
            </div>
            <div className="h-12 w-12 bg-blue-500/10 rounded-full flex items-center justify-center text-blue-500">
                <Droplets size={24} fill="currentColor" className="opacity-50" />
            </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-black text-foreground tracking-tight">Histórico</h2>
          
          {logs.length === 0 ? (
            <div className="text-center py-12 bg-card rounded-[2rem] border-2 border-dashed border-border">
              <p className="text-muted-foreground font-bold mb-4">Nenhum registro encontrado.</p>
              <Link 
                href="/log/water"
                className="text-primary font-black text-sm bg-primary/10 px-6 py-3 rounded-2xl inline-block active:scale-95 transition-all hover:bg-primary/20"
              >
                + Beber Água
              </Link>
            </div>
          ) : (
            <div className="bg-card rounded-2xl border border-border overflow-hidden">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-black text-muted-foreground uppercase tracking-widest">Hora/Data</th>
                    <th className="px-6 py-4 text-right text-xs font-black text-muted-foreground uppercase tracking-widest">Qtd.</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {logs.map((entry) => (
                    <tr key={entry.id}>
                      <td className="px-6 py-4 text-sm font-bold text-foreground">
                        {new Date(entry.date).toLocaleDateString('pt-BR', {
                            day: '2-digit',
                            month: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit'
                        })}
                      </td>
                      <td className="px-6 py-4 text-sm font-black text-foreground text-right">
                        {entry.amount} ml
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
