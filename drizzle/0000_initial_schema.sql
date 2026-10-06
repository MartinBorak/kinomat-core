CREATE TABLE "cinema" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"address" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "film_override" (
	"identity" text PRIMARY KEY NOT NULL,
	"title_sk" text,
	"title_en" text,
	"original_title" text,
	"release_year" integer,
	"runtime_minutes" integer,
	"poster_path" text,
	"imdb_id" text,
	"csfd_id" text,
	"director" text[],
	"genre_id" integer[]
);
--> statement-breakpoint
CREATE TABLE "film" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "film_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"public_id" text NOT NULL,
	"tmdb_id" integer,
	"csfd_id" text,
	"imdb_id" text,
	"wikidata_id" text,
	"title_sk" text NOT NULL,
	"title_en" text DEFAULT '' NOT NULL,
	"original_title" text DEFAULT '' NOT NULL,
	"release_year" integer,
	"runtime_minutes" integer,
	"poster_path" text,
	"director" text[] DEFAULT '{}' NOT NULL,
	"genre_id" integer[] DEFAULT '{}' NOT NULL,
	"first_seen_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "film_public_id_unique" UNIQUE("public_id")
);
--> statement-breakpoint
CREATE TABLE "genre" (
	"id" integer PRIMARY KEY NOT NULL,
	"name_sk" text NOT NULL,
	"name_en" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "programme_film" (
	"programme_id" integer NOT NULL,
	"film_id" integer NOT NULL,
	"position" integer NOT NULL,
	CONSTRAINT "programme_film_programme_id_position_pk" PRIMARY KEY("programme_id","position")
);
--> statement-breakpoint
CREATE TABLE "programme_page" (
	"cinema_id" text PRIMARY KEY NOT NULL,
	"html" text NOT NULL,
	"saved_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "programme" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "programme_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1)
);
--> statement-breakpoint
CREATE TABLE "screening" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "screening_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"cinema_id" text NOT NULL,
	"programme_id" integer NOT NULL,
	"starts_at" timestamp with time zone NOT NULL,
	"screen_name" text DEFAULT '' NOT NULL,
	"format" text[] DEFAULT '{}' NOT NULL,
	"language" text DEFAULT '' NOT NULL,
	"subtitles" text DEFAULT '' NOT NULL,
	"original_language" text DEFAULT '' NOT NULL,
	"price" numeric(6, 2),
	"booking_url" text DEFAULT '' NOT NULL,
	"source_id" text DEFAULT '' NOT NULL,
	"raw_title" text NOT NULL,
	"synopsis" text DEFAULT '' NOT NULL,
	"stated_director" text[] DEFAULT '{}' NOT NULL,
	"stated_year" integer,
	"event_note" text DEFAULT '' NOT NULL,
	"strand" text DEFAULT '' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "title_override" (
	"raw_title" text PRIMARY KEY NOT NULL,
	"kind" text NOT NULL,
	"tmdb_id" integer,
	"wikidata_id" text,
	"title" text,
	"release_year" integer,
	"billed_title" text[],
	"note" text DEFAULT '' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "title_resolution" (
	"title" text PRIMARY KEY NOT NULL,
	"film_id" integer NOT NULL,
	"evidence" text NOT NULL,
	"resolved_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "wikidata_item" (
	"tmdb_id" integer PRIMARY KEY NOT NULL,
	"wikidata_id" text NOT NULL,
	"note" text DEFAULT '' NOT NULL
);
--> statement-breakpoint
ALTER TABLE "programme_film" ADD CONSTRAINT "programme_film_programme_id_programme_id_fk" FOREIGN KEY ("programme_id") REFERENCES "public"."programme"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "programme_film" ADD CONSTRAINT "programme_film_film_id_film_id_fk" FOREIGN KEY ("film_id") REFERENCES "public"."film"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "programme_page" ADD CONSTRAINT "programme_page_cinema_id_cinema_id_fk" FOREIGN KEY ("cinema_id") REFERENCES "public"."cinema"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "screening" ADD CONSTRAINT "screening_cinema_id_cinema_id_fk" FOREIGN KEY ("cinema_id") REFERENCES "public"."cinema"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "screening" ADD CONSTRAINT "screening_programme_id_programme_id_fk" FOREIGN KEY ("programme_id") REFERENCES "public"."programme"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "title_resolution" ADD CONSTRAINT "title_resolution_film_id_film_id_fk" FOREIGN KEY ("film_id") REFERENCES "public"."film"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "film_tmdb_id_key" ON "film" USING btree ("tmdb_id");--> statement-breakpoint
CREATE UNIQUE INDEX "film_csfd_id_key" ON "film" USING btree ("csfd_id") WHERE "film"."tmdb_id" is null;--> statement-breakpoint
CREATE UNIQUE INDEX "film_imdb_id_key" ON "film" USING btree ("imdb_id") WHERE "film"."tmdb_id" is null;--> statement-breakpoint
CREATE UNIQUE INDEX "film_wikidata_id_key" ON "film" USING btree ("wikidata_id") WHERE "film"."tmdb_id" is null;--> statement-breakpoint
CREATE UNIQUE INDEX "film_uncatalogued_title_key" ON "film" USING btree ("title_sk") WHERE "film"."tmdb_id" is null and "film"."wikidata_id" is null;--> statement-breakpoint
CREATE INDEX "programme_film_film_id_idx" ON "programme_film" USING btree ("film_id");--> statement-breakpoint
CREATE UNIQUE INDEX "screening_source_key" ON "screening" USING btree ("cinema_id","source_id","starts_at","programme_id");--> statement-breakpoint
CREATE INDEX "screening_starts_at_idx" ON "screening" USING btree ("starts_at");--> statement-breakpoint
CREATE INDEX "screening_programme_id_idx" ON "screening" USING btree ("programme_id");