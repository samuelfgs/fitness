import React from 'react';
import { ArrowLeft, Check, Footprints } from 'lucide-react';
import Link from 'next/link';
import { logSteps } from '@/app/actions/steps';

export default function LogStepsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <div className="px-6 py-6 border-b border-border flex items-center justify-between">
        <Link href="/log" className="p-2 -ml-2 text-foreground bg-muted rounded-xl hover:bg-muted/80 transition-colors">
          <ArrowLeft size={24} />
        </Link>
        <h1 className="text-xl font-black text-foreground tracking-tight">Registrar Passos</h1>
        <div className="w-10" /> 
      </div>

      <div className="flex-1 p-6 space-y-8 pt-12">
        <form id="log-form" action={logSteps} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1 flex items-center gap-2">
              <Footprints size={14} className="text-purple-500" /> Passos de Hoje
            </label>
            <div className="relative">
              <input
                type="number"
                name="count"
                step="1"
                className="w-full bg-muted/50 border-none rounded-2xl p-5 text-4xl font-black focus:ring-2 focus:ring-primary pr-16 text-foreground"
                placeholder="0"
                autoFocus
                required
              />
              <span className="absolute right-5 top-1/2 -translate-y-1/2 text-muted-foreground font-bold text-sm uppercase tracking-widest">steps</span>
            </div>
          </div>
          
          <div className="bg-muted/30 p-6 rounded-[2rem] border border-border/50 text-center space-y-2">
            <p className="text-foreground font-black text-lg italic uppercase tracking-tighter">Cada passo conta!</p>
            <p className="text-sm text-muted-foreground font-bold leading-relaxed">
              Manter-se ativo ao longo do dia é fundamental para queimar calorias e melhorar sua saúde cardiovascular.
            </p>
          </div>
        </form>
      </div>

      <div className="p-6 fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-background/80 backdrop-blur-lg border-t border-border z-10">
        <button
          type="submit"
          form="log-form"
          className="w-full bg-primary text-primary-foreground font-black text-xl py-5 rounded-2xl shadow-xl shadow-primary/20 hover:bg-primary/90 transition-all active:scale-95 flex items-center justify-center gap-3"
        >
          <Check size={28} strokeWidth={3} />
          Salvar Registro
        </button>
      </div>
    </div>
  );
}
