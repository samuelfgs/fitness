import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';

// Load env vars before importing db
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function main() {
  // Dynamic import to ensure env is loaded first
  const { db } = await import("../lib/db");
  const { activities } = await import("../lib/db/schema");

  const standardFields = [
    { name: "startedAt", label: "Início", type: "datetime-local", required: true, icon: "Calendar", color: "text-green-500" },
    { name: "duration", label: "Duração", type: "number", required: true, suffix: "min", icon: "Clock", color: "text-blue-500" },
    { name: "calories", label: "Calorias", type: "number", required: false, suffix: "kcal", icon: "Flame", color: "text-orange-500" },
    { name: "notes", label: "Notas", type: "textarea", required: false, icon: "StickyNote", color: "text-muted-foreground" },
  ];

  const seeds = [
    { 
      name: 'Tênis', 
      slug: 'tennis', 
      icon: 'Tennis', 
      color: 'text-yellow-500 bg-yellow-500/10',
      fields: [
        {
          name: "type",
          label: "Tipo",
          type: "radio",
          required: true,
          options: [
            { label: "Aula", value: "aula" },
            { label: "Jogo", value: "jogo" }
          ]
        },
        ...standardFields
      ]
    },
    { 
      name: 'Natação', 
      slug: 'swimming', 
      icon: 'Waves', 
      color: 'text-cyan-500 bg-cyan-500/10', 
      fields: [...standardFields] 
    },
    { 
      name: 'Corrida', 
      slug: 'running', 
      icon: 'Footprints', 
      color: 'text-orange-500 bg-orange-500/10', 
      fields: [...standardFields] 
    },
  ];

  console.log("Seeding activities...");

  for (const seed of seeds) {
    await db.insert(activities).values({
        ...seed
    }).onConflictDoUpdate({
        target: activities.slug,
        set: seed
    });
    console.log(`Seeded ${seed.name}`);
  }

  console.log("Done!");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});