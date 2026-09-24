import { sql } from "drizzle-orm";
import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import type { BulletinContent, BulletinStatus } from "@/lib/bulletin/schema";

const timestamps = {
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
};

export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: text("role", { enum: ["admin", "editor"] }).notNull().default("editor"),
  /** Incrementado ao trocar a senha — invalida sessões antigas. */
  sessionVersion: integer("session_version").notNull().default(1),
  lastLoginAt: integer("last_login_at", { mode: "timestamp" }),
  ...timestamps,
});

export const bulletins = sqliteTable(
  "bulletins",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    slug: text("slug").notNull().unique(),
    status: text("status", { enum: ["draft", "published"] })
      .$type<BulletinStatus>()
      .notNull()
      .default("draft"),
    /** Copiado de content.referenceDate para ordenar e filtrar sem abrir o JSON. */
    referenceDate: text("reference_date").notNull(),
    headline: text("headline").notNull(),
    content: text("content", { mode: "json" }).$type<BulletinContent>().notNull(),
    publishedAt: integer("published_at", { mode: "timestamp" }),
    createdBy: integer("created_by").references(() => users.id, { onDelete: "set null" }),
    updatedBy: integer("updated_by").references(() => users.id, { onDelete: "set null" }),
    ...timestamps,
  },
  (t) => [index("bulletins_status_date_idx").on(t.status, t.referenceDate)],
);

export type User = typeof users.$inferSelect;
export type BulletinRow = typeof bulletins.$inferSelect;
