import { sql } from "drizzle-orm";
import {
  index,
  int,
  sqliteTableCreator,
  text,
} from "drizzle-orm/sqlite-core";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = sqliteTableCreator((name) => `web_${name}`);

export const posts = createTable(
  "post",
  {
    id: int("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
    name: text("name", { length: 256 }),
    createdById: text("created_by", { length: 255 })
      .notNull()
      .references(() => users.id),
    createdAt: int("created_at", { mode: "timestamp" })
      .default(sql`(unixepoch())`)
      .notNull(),
    updatedAt: int("updatedAt", { mode: "timestamp" }).$onUpdate(
      () => new Date()
    ),
  },
  (example) => ({
    createdByIdIdx: index("created_by_idx").on(example.createdById),
    nameIndex: index("name_idx").on(example.name),
  })
);

export const users = createTable("user", {
  id: text("id", { length: 255 })
    .notNull()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name", { length: 255 }).notNull(),
  email: text("email", { length: 255 }).unique().notNull(),
  emailVerified: int("email_verified", {
    mode: "timestamp",
  }).default(sql`(unixepoch())`),
  image: text("image", { length: 255 }),
  password: text("password", { length: 255 }).notNull(),
});
