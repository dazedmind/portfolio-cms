import { date, integer, pgTable, text, varchar } from "drizzle-orm/pg-core";

export const usersTable = pgTable("projects", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }).notNull(),
  description: varchar({ length: 255 }).notNull(),
  image: varchar({ length: 255 }).notNull(),
  link: varchar({ length: 255 }).notNull(),
  technologies: varchar({ length: 255 }).notNull(),
  type: varchar({ length: 255 }).notNull(),
});

export const technologiesTable = pgTable("technologies", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }).notNull(),
  icon: varchar({ length: 255 }).notNull(),
});

export const profileTable = pgTable("profile", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }).notNull(),
  title: varchar({ length: 255 }).notNull(),
  email: varchar({ length: 255 }).notNull(),
  access_key: varchar({ length: 255 }).notNull(),
  image: varchar({ length: 255 }),
  about: text().notNull(),
  github: varchar({ length: 255 }),
  linkedin: varchar({ length: 255 }),
  behance: varchar({ length: 255 }),
  facebook: varchar({ length: 255 }),
});

export const experiencesTable = pgTable("experiences", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  company: varchar({ length: 255 }).notNull(),
  position: varchar({ length: 255 }).notNull(),
  description: varchar({ length: 255 }).notNull(),
  startDate: date().notNull(),
  endDate: date().notNull(),
});