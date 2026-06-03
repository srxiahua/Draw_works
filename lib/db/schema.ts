import {
  sqliteTable,
  text,
  integer,
  real,
  primaryKey,
} from "drizzle-orm/sqlite-core";
import { relations, sql } from "drizzle-orm";
import { randomUUID } from "crypto";

export type ArtworkStatus = "pending" | "analyzing" | "ready" | "failed";
export type JobStatus = "pending" | "processing" | "completed" | "failed";
export type InputType = "image" | "url" | "text";

const uuid = (name: string) =>
  text(name)
    .primaryKey()
    .$defaultFn(() => randomUUID());

const uuidRef = (name: string) => text(name).notNull();

const timestamps = {
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
};

export const users = sqliteTable("users", {
  id: uuid("id"),
  email: text("email").notNull().unique(),
  name: text("name"),
  bio: text("bio"),
  createdAt: timestamps.createdAt,
});

export const categories = sqliteTable("categories", {
  id: uuid("id"),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  description: text("description"),
  sortOrder: integer("sort_order").default(0).notNull(),
});

export const tags = sqliteTable("tags", {
  id: uuid("id"),
  name: text("name").notNull().unique(),
});

export const artworks = sqliteTable("artworks", {
  id: uuid("id"),
  userId: uuidRef("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  categoryId: text("category_id").references(() => categories.id),
  title: text("title").notNull().default("未命名作品"),
  note: text("note"),
  storageKey: text("storage_key").notNull(),
  thumbKey: text("thumb_key").notNull(),
  mimeType: text("mime_type").notNull(),
  fileSize: integer("file_size").notNull(),
  status: text("status").$type<ArtworkStatus>().default("pending").notNull(),
  isPublic: integer("is_public", { mode: "boolean" }).default(false).notNull(),
  publicSummary: text("public_summary"),
  inputType: text("input_type").$type<InputType>().default("image").notNull(),
  sourceUrl: text("source_url"),
  textDescription: text("text_description"),
  createdAt: timestamps.createdAt,
  updatedAt: timestamps.updatedAt,
});

export const artworkTags = sqliteTable(
  "artwork_tags",
  {
    artworkId: uuidRef("artwork_id")
      .notNull()
      .references(() => artworks.id, { onDelete: "cascade" }),
    tagId: uuidRef("tag_id")
      .notNull()
      .references(() => tags.id, { onDelete: "cascade" }),
  },
  (t) => [primaryKey({ columns: [t.artworkId, t.tagId] })]
);

export const artworkAnalyses = sqliteTable("artwork_analyses", {
  id: uuid("id"),
  artworkId: uuidRef("artwork_id")
    .notNull()
    .unique()
    .references(() => artworks.id, { onDelete: "cascade" }),
  visionResult: text("vision_result", { mode: "json" })
    .notNull()
    .$type<Record<string, unknown>>(),
  summaryZh: text("summary_zh").notNull(),
  subjects: text("subjects", { mode: "json" }).$type<string[]>().notNull(),
  techniques: text("techniques", { mode: "json" }).$type<string[]>().notNull(),
  styleKeywords: text("style_keywords", { mode: "json" })
    .$type<string[]>()
    .notNull(),
  mood: text("mood"),
  colorPalette: text("color_palette"),
  composition: text("composition"),
  skillLevelEstimate: text("skill_level_estimate"),
  confidence: real("confidence"),
  createdAt: timestamps.createdAt,
});

export const analysisJobs = sqliteTable("analysis_jobs", {
  id: uuid("id"),
  artworkId: uuidRef("artwork_id")
    .notNull()
    .references(() => artworks.id, { onDelete: "cascade" }),
  status: text("status").$type<JobStatus>().default("pending").notNull(),
  attempts: integer("attempts").default(0).notNull(),
  lastError: text("last_error"),
  createdAt: timestamps.createdAt,
  updatedAt: timestamps.updatedAt,
});

export const styleProfiles = sqliteTable("style_profiles", {
  id: uuid("id"),
  userId: uuidRef("user_id")
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: "cascade" }),
  aggregatedTraits: text("aggregated_traits", { mode: "json" })
    .notNull()
    .$type<Record<string, unknown>>(),
  radarScores: text("radar_scores", { mode: "json" }).$type<
    Record<string, number>
  >(),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const growthAdvices = sqliteTable("growth_advices", {
  id: uuid("id"),
  userId: uuidRef("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  focusAreas: text("focus_areas").notNull(),
  exercises: text("exercises").notNull(),
  references: text("references").notNull(),
  generatedAt: integer("generated_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const usersRelations = relations(users, ({ many, one }) => ({
  artworks: many(artworks),
  styleProfile: one(styleProfiles),
  growthAdvices: many(growthAdvices),
}));

export const artworksRelations = relations(artworks, ({ one, many }) => ({
  user: one(users, { fields: [artworks.userId], references: [users.id] }),
  category: one(categories, {
    fields: [artworks.categoryId],
    references: [categories.id],
  }),
  analysis: one(artworkAnalyses),
  artworkTags: many(artworkTags),
}));

export const artworkTagsRelations = relations(artworkTags, ({ one }) => ({
  artwork: one(artworks, {
    fields: [artworkTags.artworkId],
    references: [artworks.id],
  }),
  tag: one(tags, { fields: [artworkTags.tagId], references: [tags.id] }),
}));
