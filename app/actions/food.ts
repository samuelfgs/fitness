'use server';

import { db } from "@/lib/db";
import { foodLogs } from "@/lib/db/schema";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { eq, and, gte, lte, desc } from "drizzle-orm";

const apiKey = process.env.GEMINI_API_KEY;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

export async function parseFood(rawText: string, history: { role: string, content: string }[] = []) {
  if (!genAI) {
    throw new Error("Gemini API key is not configured");
  }

  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const prompt = `
    Analyze the following food consumption text and extract the meals, items, calories, and macros (protein, carbs, fat).
    Text: "${rawText}"
    
    Current History of this conversation:
    ${history.map(h => `${h.role}: ${h.content}`).join('\n')}

    Return the result as a JSON object with the following structure:
    {
      "meals": [
        {
          "mealName": "string",
          "items": [
            { "name": "string", "quantity": "string", "calories": number, "protein": number, "carbs": number, "fat": number }
          ],
          "totalCalories": number,
          "totalProtein": number,
          "totalCarbs": number,
          "totalFat": number
        }
      ]
    }
    
    The output must be ONLY the JSON object, no markdown, no explanation.
    Separate by meal if multiple are mentioned.
    Estimate calories and macros for each item based on typical values for the given portion.
    Ensure totalCalories/Protein/Carbs/Fat for the meal is the sum of its items.
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const aiText = response.text();
    
    const jsonMatch = aiText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Could not find JSON in AI response");
    }
    
    return JSON.parse(jsonMatch[0]);
  } catch (error: any) {
    if (error.message?.includes("429")) {
      throw new Error("Limite de cota atingido. Tente novamente em 1 minuto.");
    }
    throw error;
  }
}

export async function saveFood(meals: any[], rawText: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  try {
    for (const meal of meals) {
      await db.insert(foodLogs).values({
        userId: user.id,
        mealName: meal.mealName,
        rawText: rawText,
        content: meal.items,
        totalCalories: Math.round(meal.totalCalories),
        totalProtein: Math.round(meal.totalProtein),
        totalCarbs: Math.round(meal.totalCarbs),
        totalFat: Math.round(meal.totalFat),
      });
    }

    revalidatePath("/dashboard");
    revalidatePath("/food");
    return { success: true };
  } catch (error: any) {
    console.error("Error in saveFood:", error);
    throw new Error("Erro ao salvar no banco de dados.");
  }
}

export async function getFoodLogs(date: Date = new Date()) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);

  return await db.select()
    .from(foodLogs)
    .where(
        and(
            eq(foodLogs.userId, user.id),
            gte(foodLogs.date, start),
            lte(foodLogs.date, end)
        )
    )
    .orderBy(desc(foodLogs.date));
}

export async function deleteFoodLog(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  try {
    await db.delete(foodLogs).where(and(eq(foodLogs.id, id), eq(foodLogs.userId, user.id)));
    revalidatePath("/dashboard");
    revalidatePath("/food");
    return { success: true };
  } catch (error) {
    console.error("Error in deleteFoodLog:", error);
    throw new Error("Erro ao excluir registro.");
  }
}

export async function deleteFoodItem(logId: string, itemIndex: number) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  try {
    const [log] = await db.select()
      .from(foodLogs)
      .where(and(eq(foodLogs.id, logId), eq(foodLogs.userId, user.id)))
      .limit(1);

    if (!log) throw new Error("Registro não encontrado.");

    const content = log.content as any[];
    if (content.length <= 1) {
      // If it's the last item, delete the whole log
      return await deleteFoodLog(logId);
    }

    const itemToDelete = content[itemIndex];
    const newContent = content.filter((_, i) => i !== itemIndex);

    // Recalculate totals
    const newTotalCalories = log.totalCalories - (itemToDelete.calories || 0);
    const newTotalProtein = (log.totalProtein || 0) - (itemToDelete.protein || 0);
    const newTotalCarbs = (log.totalCarbs || 0) - (itemToDelete.carbs || 0);
    const newTotalFat = (log.totalFat || 0) - (itemToDelete.fat || 0);

    await db.update(foodLogs)
      .set({
        content: newContent,
        totalCalories: Math.max(0, newTotalCalories),
        totalProtein: Math.max(0, newTotalProtein),
        totalCarbs: Math.max(0, newTotalCarbs),
        totalFat: Math.max(0, newTotalFat),
      })
      .where(eq(foodLogs.id, logId));

    revalidatePath("/dashboard");
    revalidatePath("/food");
    return { success: true };
  } catch (error) {
    console.error("Error in deleteFoodItem:", error);
    throw new Error("Erro ao excluir item.");
  }
}