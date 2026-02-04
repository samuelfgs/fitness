CREATE TABLE "activities" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"slug" varchar(50) NOT NULL,
	"icon" varchar(50),
	"color" varchar(20),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "activities_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "workouts" ADD COLUMN "activity_id" uuid;--> statement-breakpoint
ALTER TABLE "workouts" ADD COLUMN "duration" integer;--> statement-breakpoint
ALTER TABLE "workouts" ADD COLUMN "calories" integer;--> statement-breakpoint
ALTER TABLE "workouts" ADD COLUMN "started_at" timestamp;--> statement-breakpoint
ALTER TABLE "workouts" ADD COLUMN "details" jsonb;--> statement-breakpoint
ALTER TABLE "workouts" ADD CONSTRAINT "workouts_activity_id_activities_id_fk" FOREIGN KEY ("activity_id") REFERENCES "public"."activities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_workouts_activity_id" ON "workouts" USING btree ("activity_id");--> statement-breakpoint
ALTER TABLE "workouts" DROP COLUMN "name";