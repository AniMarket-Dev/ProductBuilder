CREATE TABLE IF NOT EXISTS "constructor_uploads" (
  "id" varchar(64) PRIMARY KEY NOT NULL,
  "original_image_url" text NOT NULL,
  "storage_key" text NOT NULL,
  "mime_type" varchar(64) NOT NULL,
  "file_size" integer NOT NULL,
  "width" integer NOT NULL,
  "height" integer NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "constructor_builds" (
  "id" varchar(64) PRIMARY KEY NOT NULL,
  "status" varchar(32) NOT NULL,
  "template_product_id" integer NOT NULL,
  "upload_id" varchar(64) NOT NULL,
  "original_image_url" text NOT NULL,
  "original_storage_key" text NOT NULL,
  "preview_image_url" text,
  "preview_storage_key" text,
  "crop_settings_json" jsonb NOT NULL,
  "selection_json" jsonb NOT NULL,
  "quantity" integer NOT NULL,
  "selected_variant_snapshot_json" jsonb,
  "generated_product_id" integer,
  "generated_variant_id" integer,
  "generated_product_handle" text,
  "error_text" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "completed_at" timestamp with time zone
);
