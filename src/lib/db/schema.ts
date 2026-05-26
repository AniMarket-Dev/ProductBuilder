import {
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

export const constructorUploads = pgTable("constructor_uploads", {
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  fileSize: integer("file_size").notNull(),
  height: integer("height").notNull(),
  id: varchar("id", { length: 64 }).primaryKey(),
  mimeType: varchar("mime_type", { length: 64 }).notNull(),
  originalImageUrl: text("original_image_url").notNull(),
  storageKey: text("storage_key").notNull(),
  width: integer("width").notNull(),
});

export const constructorBuilds = pgTable("constructor_builds", {
  completedAt: timestamp("completed_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  cropSettingsJson: jsonb("crop_settings_json").notNull(),
  errorText: text("error_text"),
  generatedProductHandle: text("generated_product_handle"),
  generatedProductId: integer("generated_product_id"),
  generatedVariantId: integer("generated_variant_id"),
  id: varchar("id", { length: 64 }).primaryKey(),
  originalImageUrl: text("original_image_url").notNull(),
  originalStorageKey: text("original_storage_key").notNull(),
  previewImageUrl: text("preview_image_url"),
  previewStorageKey: text("preview_storage_key"),
  quantity: integer("quantity").notNull(),
  selectedVariantSnapshotJson: jsonb("selected_variant_snapshot_json"),
  selectionJson: jsonb("selection_json").notNull(),
  status: varchar("status", { length: 32 }).notNull(),
  templateProductId: integer("template_product_id").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  uploadId: varchar("upload_id", { length: 64 }).notNull(),
});
