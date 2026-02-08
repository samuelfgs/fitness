import React from 'react';
import { ArrowLeft, Check, Image as ImageIcon } from 'lucide-react';
import Link from 'next/link';
import { uploadProgressPhotos } from '@/app/actions/progress-photos';
import { SubmitButton } from '@/components/SubmitButton';
import { ImageUploadInput } from '@/components/ImageUploadInput';

export default function LogProgressPage() {
  return (
    <form action={uploadProgressPhotos} className="min-h-screen flex flex-col bg-background pb-32">
      <div className="px-6 py-6 border-b border-border flex items-center justify-between">
        <Link href="/log" className="p-2 -ml-2 text-foreground bg-muted rounded-xl hover:bg-muted/80 transition-colors">
          <ArrowLeft size={24} />
        </Link>
        <h1 className="text-xl font-black text-foreground tracking-tight">Fotos de Progresso</h1>
        <div className="w-10" /> 
      </div>

      <div className="flex-1 p-6 space-y-8">
        <div className="flex flex-col items-center justify-center space-y-4 mb-2">
          <div className="bg-primary/10 w-20 h-20 rounded-[2rem] flex items-center justify-center text-primary shadow-lg shadow-primary/10">
            <ImageIcon size={40} strokeWidth={2.5} />
          </div>
          <div className="text-center space-y-1">
            <h2 className="text-2xl font-black text-foreground tracking-tight">Fotos de Hoje</h2>
            <p className="text-muted-foreground font-medium text-sm">Registre seu progresso visual.</p>
          </div>
        </div>

        <div className="bg-primary/5 p-6 rounded-[2rem] border border-primary/10 text-center space-y-2">
          <p className="text-primary font-black text-lg uppercase tracking-tighter">Registro Quinzenal</p>
          <p className="text-sm text-muted-foreground font-bold leading-relaxed">
            Tente usar a mesma iluminação e roupas para facilitar a comparação.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <ImageUploadInput name="front" label="Frente" />
          <ImageUploadInput name="back" label="Costas" />
          <ImageUploadInput name="sideLeft" label="Lado Esquerdo" />
          <ImageUploadInput name="sideRight" label="Lado Direito" />
        </div>
      </div>

      <div className="p-6 fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-background/80 backdrop-blur-lg border-t border-border z-10">
        <SubmitButton
          className="w-full bg-primary text-primary-foreground font-black text-xl py-5 rounded-2xl shadow-xl shadow-primary/20 hover:bg-primary/90 transition-all active:scale-95 flex items-center justify-center gap-3"
        >
          <Check size={28} strokeWidth={3} />
          Salvar Fotos
        </SubmitButton>
      </div>
    </form>
  );
}
