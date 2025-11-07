import { boolean, date, integer, pgTable, text, varchar } from "drizzle-orm/pg-core";

export const projectsTable = pgTable("projects", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }).notNull(),
  description: varchar({ length: 255 }).notNull(),
  image: varchar({ length: 255 }).notNull(),
  link: varchar({ length: 255 }).notNull(),
  technologies: varchar({ length: 255 }).notNull(),
  type: varchar({ length: 255 }).notNull(),
  user_id: integer().references(() => profileTable.id).notNull(),
});

export const skillsTable = pgTable("skills", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }).notNull(),
  category: varchar({ length: 255 }).notNull(),
  user_id: integer().references(() => profileTable.id).notNull(),
});

export const profileTable = pgTable("profile", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }).notNull(),
  title: varchar({ length: 255 }).notNull(),
  email: varchar({ length: 255 }).notNull(),
  access_key: varchar({ length: 255 }).notNull(),
  api_key: varchar({ length: 255 }).unique().notNull(),
  image: varchar({ length: 255 }),
  about: text().notNull(),
  github: varchar({ length: 255 }),
  linkedin: varchar({ length: 255 }),
  behance: varchar({ length: 255 }),
  facebook: varchar({ length: 255 }),
});

export const employmentsTable = pgTable("employments", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  company: varchar({ length: 255 }).notNull(),
  position: varchar({ length: 255 }).notNull(),
  description: varchar({ length: 255 }).notNull(),
  startDate: date().notNull(),
  endDate: date(),
  isActive: boolean().notNull().default(false),
  user_id: integer().references(() => profileTable.id).notNull(),
});

export const systemPromptsTable = pgTable("system_prompts", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  prompt: text().notNull(),
  user_id: integer().references(() => profileTable.id).notNull(),
});