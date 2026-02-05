'use client';

import React, { useState, useEffect } from 'react';
import { X, Loader2, Save, Plus } from 'lucide-react';
import { registerFood } from "@/app/actions/food";
import { Button } from "@/components/ui/Button";

interface RegisterFoodFormProps {
  onSuccess: () => void;
  onCancel: () => void;
  initialData?: {
    id: string;
    name: string;
    servingSize: string | null;
    calories: number;
    protein: number | null;
    carbs: number | null;
    fat: number | null;
  };
}

export function RegisterFoodForm({ onSuccess, onCancel, initialData }: RegisterFoodFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    servingSize: '',
    calories: '',
    protein: '',
    carbs: '',
    fat: ''
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        servingSize: initialData.servingSize || '',
        calories: String(initialData.calories),
        protein: String(initialData.protein || ''),
        carbs: String(initialData.carbs || ''),
        fat: String(initialData.fat || '')
      });
    }
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await registerFood({
        id: initialData?.id,
        name: formData.name,
        servingSize: formData.servingSize,
        calories: Number(formData.calories),
        protein: formData.protein ? Number(formData.protein) : 0,
        carbs: formData.carbs ? Number(formData.carbs) : 0,
        fat: formData.fat ? Number(formData.fat) : 0,
      } as any); // Using as any because I'll update registerFood to accept ID
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Erro ao registrar alimento.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="bg-card border border-border rounded-[2.5rem] p-8 space-y-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="bg-blue-500/10 w-12 h-12 rounded-2xl flex items-center justify-center text-blue-500">
          <Plus size={24} strokeWidth={2.5} />
        </div>
        <button 
          onClick={onCancel}
          className="p-2 bg-muted rounded-xl text-muted-foreground hover:text-foreground transition-colors"
        >
          <X size={20} />
        </button>
      </div>
      
      <div className="space-y-2">
        <h2 className="text-2xl font-black text-foreground tracking-tight">
          {initialData ? 'Editar Alimento' : 'Novo Alimento'}
        </h2>
        <p className="text-muted-foreground font-medium text-sm leading-relaxed">
          {initialData 
            ? 'Atualize as informações nutricionais deste alimento.' 
            : 'Cadastre as informações nutricionais para a IA usar como referência.'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="text-xs font-black text-muted-foreground uppercase px-1">Nome do Alimento</label>
          <input
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Ex: Whey Protein Vanilla"
            className="w-full bg-muted border-none rounded-2xl p-4 text-foreground font-medium placeholder:text-muted-foreground/50 focus:ring-2 focus:ring-blue-500 transition-all"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-black text-muted-foreground uppercase px-1">Porção</label>
            <input
              name="servingSize"
              value={formData.servingSize}
              onChange={handleChange}
              placeholder="30g"
              className="w-full bg-muted border-none rounded-2xl p-4 text-foreground font-medium placeholder:text-muted-foreground/50 focus:ring-2 focus:ring-blue-500 transition-all"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-black text-muted-foreground uppercase px-1">Calorias (kcal)</label>
            <input
              name="calories"
              type="number"
              value={formData.calories}
              onChange={handleChange}
              placeholder="120"
              className="w-full bg-muted border-none rounded-2xl p-4 text-foreground font-medium placeholder:text-muted-foreground/50 focus:ring-2 focus:ring-blue-500 transition-all"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="space-y-2">
            <label className="text-xs font-black text-muted-foreground uppercase px-1 text-center block">Proteína (g)</label>
            <input
              name="protein"
              type="number"
              value={formData.protein}
              onChange={handleChange}
              placeholder="24"
              className="w-full bg-muted border-none rounded-2xl p-4 text-foreground font-medium placeholder:text-muted-foreground/50 focus:ring-2 focus:ring-blue-500 transition-all text-center"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-black text-muted-foreground uppercase px-1 text-center block">Carbos (g)</label>
            <input
              name="carbs"
              type="number"
              value={formData.carbs}
              onChange={handleChange}
              placeholder="3"
              className="w-full bg-muted border-none rounded-2xl p-4 text-foreground font-medium placeholder:text-muted-foreground/50 focus:ring-2 focus:ring-blue-500 transition-all text-center"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-black text-muted-foreground uppercase px-1 text-center block">Gordura (g)</label>
            <input
              name="fat"
              type="number"
              value={formData.fat}
              onChange={handleChange}
              placeholder="1"
              className="w-full bg-muted border-none rounded-2xl p-4 text-foreground font-medium placeholder:text-muted-foreground/50 focus:ring-2 focus:ring-blue-500 transition-all text-center"
            />
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-xs font-bold">
            {error}
          </div>
        )}

        <Button 
          type="submit"
          loading={isLoading}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-black py-8 rounded-3xl shadow-lg shadow-blue-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
        >
          <Save size={20} />
          SALVAR ALIMENTO
        </Button>
      </form>
    </div>
  );
}
