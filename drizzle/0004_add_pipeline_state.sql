CREATE TABLE "cinemax_film" (
	"slug" text PRIMARY KEY NOT NULL,
	"film_id" text NOT NULL,
	"seen_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pipeline_run" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "pipeline_run_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"mode" text NOT NULL,
	"started_at" timestamp with time zone NOT NULL,
	"finished_at" timestamp with time zone,
	"status" text NOT NULL,
	"failed_cinema" text[] DEFAULT '{}' NOT NULL,
	"unresolved_count" integer DEFAULT 0 NOT NULL,
	"summary" text DEFAULT '' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "publication" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "publication_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"published_at" timestamp with time zone NOT NULL,
	"film_count" integer NOT NULL,
	"screening_count" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "scraped_day" (
	"cinema_id" text NOT NULL,
	"date" date NOT NULL,
	"screenings" jsonb NOT NULL,
	"scraped_at" timestamp with time zone NOT NULL,
	CONSTRAINT "scraped_day_cinema_id_date_pk" PRIMARY KEY("cinema_id","date")
);
--> statement-breakpoint
ALTER TABLE "programme_page" ADD COLUMN "source" text DEFAULT 'pasted' NOT NULL;--> statement-breakpoint
ALTER TABLE "scraped_day" ADD CONSTRAINT "scraped_day_cinema_id_cinema_id_fk" FOREIGN KEY ("cinema_id") REFERENCES "public"."cinema"("id") ON DELETE no action ON UPDATE no action;