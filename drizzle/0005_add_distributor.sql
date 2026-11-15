CREATE TABLE "distributor" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"website" text DEFAULT '' NOT NULL
);
--> statement-breakpoint
ALTER TABLE "film" ADD COLUMN "distributor_id" text;--> statement-breakpoint
ALTER TABLE "film" ADD COLUMN "distributor_url" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "film" ADD CONSTRAINT "film_distributor_id_distributor_id_fk" FOREIGN KEY ("distributor_id") REFERENCES "public"."distributor"("id") ON DELETE no action ON UPDATE no action;