import React from 'react';
import { ArrowLeft, Check, GlassWater, Calendar, Clock } from 'lucide-react';
import Link from 'next/link';
import { logWater } from '@/app/actions/water';
import { SubmitButton } from '@/components/SubmitButton';
import { cookies } from 'next/headers';

export default async function LogWaterPage() {
  const cookieStore = await cookies();
  const timezone = cookieStore.get('user-timezone')?.value || 'America/Sao_Paulo';
  
  const now = new Date();
  
  // Format date and time for the user's timezone
  const dateFormatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  const timeFormatter = new Intl.DateTimeFormat('pt-BR', {
    timeZone: timezone,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  const defaultDate = dateFormatter.format(now);
  const defaultTime = timeFormatter.format(now);

  return (
    <form action={logWater} className="min-h-screen flex flex-col bg-background">
      <div className="px-6 py-6 border-b border-border flex items-center justify-between">
        <Link href="/log" className="p-2 -ml-2 text-foreground bg-muted rounded-xl hover:bg-muted/80 transition-colors">
          <ArrowLeft size={24} />
        </Link>
        <h1 className="text-xl font-black text-foreground tracking-tight">Registrar Água</h1>
        <div className="w-10" /> 
      </div>

      <div className="flex-1 p-6 space-y-8 pt-12">
        <div className="space-y-2">
          <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1 flex items-center gap-2">
            <GlassWater size={14} className="text-blue-500" /> Quantidade
          </label>
          <div className="relative">
            <input
              type="number"
              name="amount"
              step="1"
              className="w-full bg-muted/50 border-none rounded-2xl p-5 text-4xl font-black focus:ring-2 focus:ring-primary pr-16 text-foreground"
              placeholder="0"
              autoFocus
              required
            />
            <span className="absolute right-5 top-1/2 -translate-y-1/2 text-muted-foreground font-bold text-sm uppercase tracking-widest">ml</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1 flex items-center gap-2">
              <Calendar size={14} className="text-primary" /> Data
            </label>
            <input
              type="date"
              name="date"
              defaultValue={defaultDate}
              className="w-full bg-muted/50 border-none rounded-2xl p-4 font-bold text-foreground focus:ring-2 focus:ring-primary"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1 flex items-center gap-2">
              <Clock size={14} className="text-primary" /> Hora
            </label>
            <input
              type="time"
              name="time"
              defaultValue={defaultTime}
              className="w-full bg-muted/50 border-none rounded-2xl p-4 font-bold text-foreground focus:ring-2 focus:ring-primary"
              required
            />
          </div>
        </div>
        
        <div className="bg-muted/30 p-6 rounded-[2rem] border border-border/50 text-center space-y-2">
          <p className="text-foreground font-black text-lg italic uppercase tracking-tighter">Hidrate-se!</p>
          <p className="text-sm text-muted-foreground font-bold leading-relaxed">
            Beber água regularmente é essencial para sua saúde e desempenho nos treinos.
          </p>
        </div>
      </div>

      <div className="p-6 fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-background/80 backdrop-blur-lg border-t border-border z-10">
        <SubmitButton
          className="w-full bg-primary text-primary-foreground font-black text-xl py-5 rounded-2xl shadow-xl shadow-primary/20 hover:bg-primary/90 transition-all active:scale-95 flex items-center justify-center gap-3"
        >
          <Check size={28} strokeWidth={3} />
          Salvar Registro
        </SubmitButton>
      </div>
    </form>
  );
}
