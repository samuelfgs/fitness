import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { getProfile, updateProfile } from '@/app/actions/profile';
import BottomNav from '@/components/BottomNav';
import { ArrowLeft, User, Calendar, Ruler, Target, Utensils, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { SubmitButton } from '@/components/SubmitButton';

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/");
  }

  const profile = await getProfile();

  async function handleSubmit(formData: FormData) {
    "use server";
    
    const age = formData.get("age") ? parseInt(formData.get("age") as string) : undefined;
    const height = formData.get("height") ? parseInt(formData.get("height") as string) : undefined;
    const desiredWeightKg = formData.get("desiredWeight") ? parseFloat(formData.get("desiredWeight") as string) : undefined;
    const weightReference = formData.get("weightReference") as string | undefined;
    const kcalGoal = formData.get("kcalGoal") ? parseInt(formData.get("kcalGoal") as string) : undefined;

    await updateProfile({
      age,
      height,
      desiredWeight: desiredWeightKg ? Math.round(desiredWeightKg * 1000) : undefined,
      weightReference,
      kcalGoal,
    });

    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-background pb-32">
      <div className="max-w-md mx-auto pt-8 px-6 space-y-8">
        <header className="flex items-center space-x-4">
          <Link href="/dashboard" className="h-10 w-10 bg-card rounded-xl border border-border flex items-center justify-center active:scale-95 transition-all">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-2xl font-black text-foreground tracking-tight">Meu Perfil</h1>
        </header>

        <div className="bg-card p-6 rounded-[2rem] shadow-sm border border-border">
          <form action={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="age" className="flex items-center space-x-2">
                  <Calendar size={16} className="text-primary" />
                  <span>Idade</span>
                </Label>
                <Input 
                  id="age" 
                  name="age" 
                  type="number" 
                  placeholder="Ex: 25" 
                  defaultValue={profile?.age || ''}
                  className="bg-background/50 border-border rounded-xl h-12"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="height" className="flex items-center space-x-2">
                  <Ruler size={16} className="text-primary" />
                  <span>Altura (cm)</span>
                </Label>
                <Input 
                  id="height" 
                  name="height" 
                  type="number" 
                  placeholder="Ex: 175" 
                  defaultValue={profile?.height || ''}
                  className="bg-background/50 border-border rounded-xl h-12"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="desiredWeight" className="flex items-center space-x-2">
                  <Target size={16} className="text-primary" />
                  <span>Peso Desejado (kg)</span>
                </Label>
                <Input 
                  id="desiredWeight" 
                  name="desiredWeight" 
                  type="number" 
                  step="0.1"
                  placeholder="Ex: 75.5" 
                  defaultValue={profile?.desiredWeight ? profile.desiredWeight / 1000 : ''}
                  className="bg-background/50 border-border rounded-xl h-12"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="weightReference" className="flex items-center space-x-2">
                  <TrendingUp size={16} className="text-primary" />
                  <span>Referência de Diferença de Peso</span>
                </Label>
                <select 
                  id="weightReference" 
                  name="weightReference" 
                  defaultValue={profile?.weightReference || 'previous'}
                  className="w-full bg-background/50 border border-border rounded-xl h-12 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="previous">Peso Anterior</option>
                  <option value="starting">Peso Inicial</option>
                  <option value="desired">Meta de Peso</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="kcalGoal" className="flex items-center space-x-2">
                  <Utensils size={16} className="text-primary" />
                  <span>Meta de Calorias (kcal)</span>
                </Label>
                <Input 
                  id="kcalGoal" 
                  name="kcalGoal" 
                  type="number" 
                  placeholder="Ex: 2200" 
                  defaultValue={profile?.kcalGoal || ''}
                  className="bg-background/50 border-border rounded-xl h-12"
                />
              </div>
            </div>

            <SubmitButton className="w-full h-14 rounded-2xl font-black text-lg shadow-lg shadow-primary/20">
              Salvar Perfil
            </SubmitButton>
          </form>
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
