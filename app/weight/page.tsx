import React from 'react';
import { ArrowLeft, Plus } from 'lucide-react';
import Link from 'next/link';
import { db } from '@/lib/db';
import { weightMeasurements } from '@/lib/db/schema';
import { desc, eq } from 'drizzle-orm';
import { createClient } from '@/lib/supabase/server';
import WeightEvolutionChart from '@/components/WeightEvolutionChart';

import { redirect } from 'next/navigation';

export default async function WeightPage() {
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

  const weights = await db.select()
    .from(weightMeasurements)
    .where(eq(weightMeasurements.userId, user.id))
    .orderBy(desc(weightMeasurements.date));

  return (
    <div className="min-h-screen flex flex-col bg-background pb-32">
      <div className="px-6 py-6 border-b border-border flex items-center justify-between">
        <Link href="/dashboard" className="p-2 -ml-2 text-foreground bg-muted rounded-xl hover:bg-muted/80 transition-colors">
          <ArrowLeft size={24} />
        </Link>
        <h1 className="text-xl font-black text-foreground tracking-tight">Evolução de Peso</h1>
        <Link href="/log/weight" className="p-2 -mr-2 text-primary bg-primary/10 rounded-xl hover:bg-primary/20 transition-colors">
          <Plus size={24} />
        </Link>
      </div>

      <div className="flex-1 p-6">
        {/* Weight Evolution Chart */}
        <WeightEvolutionChart weights={weights} />

        <div className="space-y-4">
          <h2 className="text-xl font-black text-foreground tracking-tight">Histórico</h2>
          
          {weights.length === 0 ? (
            <div className="text-center py-12 bg-card rounded-[2rem] border-2 border-dashed border-border">
              <p className="text-muted-foreground font-bold mb-4">Nenhum registro encontrado.</p>
              <Link 
                href="/log/weight"
                className="text-primary font-black text-sm bg-primary/10 px-6 py-3 rounded-2xl inline-block active:scale-95 transition-all hover:bg-primary/20"
              >
                + Registrar Peso
              </Link>
            </div>
          ) : (
            <div className="bg-card rounded-2xl border border-border overflow-hidden">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-black text-muted-foreground uppercase tracking-widest">Data</th>
                    <th className="px-6 py-4 text-right text-xs font-black text-muted-foreground uppercase tracking-widest">Peso</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {weights.map((entry) => (
                    <tr key={entry.id}>
                      <td className="px-6 py-4 text-sm font-bold text-foreground">
                        {new Date(entry.date).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="px-6 py-4 text-sm font-black text-foreground text-right">
                        {(entry.weight ?? 0) / 1000} kg
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
