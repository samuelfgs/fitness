CREATE TABLE "food_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"meal_name" varchar(255) NOT NULL,
	"raw_text" text,
	"content" jsonb NOT NULL,
	"total_calories" integer NOT NULL,
	"total_protein" integer,
	"total_carbs" integer,
	"total_fat" integer,
	"date" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "idx_food_logs_user_id" ON "food_logs" USING btree ("user_id");