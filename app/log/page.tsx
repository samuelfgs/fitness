import React from 'react';
import { ArrowLeft, Dumbbell, Droplets, Scale, Footprints, X } from 'lucide-react';
import Link from 'next/link';

export default function LogSelectorPage() {
  const options = [
    {
      title: 'Treino',
      description: 'Registre sua atividade física',
      icon: Dumbbell,
      href: '/log/activity',
      color: 'bg-orange-500',
      textColor: 'text-orange-500',
    },
    {
      title: 'Água',
      description: 'Marque quanto você bebeu',
      icon: Droplets,
      href: '/log/water',
      color: 'bg-blue-500',
      textColor: 'text-blue-500',
    },
    {
      title: 'Peso',
      description: 'Acompanhe sua evolução',
      icon: Scale,
      href: '/log/weight',
      color: 'bg-emerald-500',
      textColor: 'text-emerald-500',
    },
    {
      title: 'Passos',
      description: 'Contabilize sua caminhada',
      icon: Footprints,
      href: '/log/steps',
      color: 'bg-purple-500',
      textColor: 'text-purple-500',
    },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="px-6 py-6 flex items-center justify-between">
        <Link 
          href="/dashboard" 
          className="p-2 -ml-2 text-foreground bg-muted rounded-xl hover:bg-muted/80 transition-colors"
        >
          <X size={24} />
        </Link>
        <h1 className="text-xl font-black text-foreground tracking-tight">O que vamos registrar?</h1>
        <div className="w-10" />
      </div>

      <div className="flex-1 px-6 py-4 space-y-4">
        {options.map((option) => (
          <Link
            key={option.title}
            href={option.href}
            className="flex items-center p-6 bg-card border border-border rounded-[2.5rem] active:scale-[0.98] transition-all hover:shadow-md group"
          >
            <div className={`${option.color} p-4 rounded-2xl text-white mr-5 shadow-lg shadow-current/20`}>
              <option.icon size={28} strokeWidth={2.5} />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-black text-foreground">{option.title}</h2>
              <p className="text-muted-foreground font-medium text-sm leading-tight">{option.description}</p>
            </div>
            <div className={`${option.textColor} opacity-0 group-hover:opacity-100 transition-opacity`}>
              <ArrowLeft className="rotate-180" size={20} strokeWidth={3} />
            </div>
          </Link>
        ))}
      </div>

      <div className="p-10 text-center">
        <p className="text-muted-foreground font-bold text-xs uppercase tracking-widest">
          Mantenha a constância para ver resultados.
        </p>
      </div>
    </div>
  );
}
