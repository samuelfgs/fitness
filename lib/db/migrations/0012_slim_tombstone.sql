ALTER TABLE "profiles" ADD COLUMN "water_goal" integer DEFAULT 2000;--> statement-breakpoint
ALTER TABLE "weight_measurements" ADD COLUMN "is_reference" boolean DEFAULT false;