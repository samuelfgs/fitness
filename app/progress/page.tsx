import React from 'react';
import { ArrowLeft, Plus, Calendar } from 'lucide-react';
import Link from 'next/link';
import { getAllProgressPhotos } from '@/app/actions/progress-photos';

export default async function ProgressPage() {
  const photos = await getAllProgressPhotos();

  return (
    <div className="min-h-screen flex flex-col bg-background pb-32">
      <div className="px-6 py-6 border-b border-border flex items-center justify-between">
        <Link href="/dashboard" className="p-2 -ml-2 text-foreground bg-muted rounded-xl hover:bg-muted/80 transition-colors">
          <ArrowLeft size={24} />
        </Link>
        <h1 className="text-xl font-black text-foreground tracking-tight">Evolução Corporal</h1>
        <Link href="/log/progress" className="p-2 -mr-2 text-primary bg-primary/10 rounded-xl hover:bg-primary/20 transition-colors">
          <Plus size={24} />
        </Link>
      </div>

      <div className="flex-1 p-6 space-y-8">
        {/* Debug: <p className="text-xs">Photos found: {photos.length}</p> */}
        {photos.length === 0 ? (
          <div className="text-center py-12 bg-card rounded-[2rem] border-2 border-dashed border-border">
            <p className="text-muted-foreground font-bold mb-4">Nenhuma foto registrada.</p>
            <Link 
              href="/log/progress"
              className="text-primary font-black text-sm bg-primary/10 px-6 py-3 rounded-2xl inline-block active:scale-95 transition-all hover:bg-primary/20"
            >
              + Adicionar Fotos
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {photos.map((entry) => (
              <div key={entry.id} className="bg-card rounded-[2rem] border border-border overflow-hidden shadow-sm">
                <div className="px-6 py-4 border-b border-border/50 bg-muted/30 flex items-center gap-2">
                  <Calendar size={16} className="text-muted-foreground" />
                  <span className="font-black text-foreground text-sm uppercase tracking-wider">
                    {new Date(entry.date).toLocaleDateString('pt-BR', { 
                      day: 'numeric', 
                      month: 'long', 
                      year: 'numeric' 
                    })}
                  </span>
                </div>
                
                <div className="p-4 grid grid-cols-2 gap-2">
                  {entry.frontUrl && (
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest pl-1">Frente</p>
                      <img src={entry.frontUrl} alt="Frente" className="w-full aspect-[3/4] object-cover rounded-xl bg-muted" />
                    </div>
                  )}
                  {entry.backUrl && (
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest pl-1">Costas</p>
                      <img src={entry.backUrl} alt="Costas" className="w-full aspect-[3/4] object-cover rounded-xl bg-muted" />
                    </div>
                  )}
                  {entry.sideLeftUrl && (
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest pl-1">Esq.</p>
                      <img src={entry.sideLeftUrl} alt="Lado Esquerdo" className="w-full aspect-[3/4] object-cover rounded-xl bg-muted" />
                    </div>
                  )}
                  {entry.sideRightUrl && (
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest pl-1">Dir.</p>
                      <img src={entry.sideRightUrl} alt="Lado Direito" className="w-full aspect-[3/4] object-cover rounded-xl bg-muted" />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
