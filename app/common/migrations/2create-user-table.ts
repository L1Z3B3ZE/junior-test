import { type Kysely, sql } from "kysely";
import { UserRoles } from "../enum/user-roles";

export async function up(db: Kysely<any>) {
    await db.schema
        .createTable("users")
        .addColumn("id", "uuid", (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
        .addColumn("email", "varchar(255)", (col) => col.unique().notNull())
        .addColumn("password", "varchar(255)", (col) => col.notNull())
        .addColumn("role_id", "integer", (col) => col.references("roles.id").onDelete("no action").defaultTo(UserRoles.USER).notNull())
        .addColumn("created_at", "timestamp", (col) => col.defaultTo(sql`now()`).notNull())
        .execute();
}

export async function down(db: Kysely<any>) {
    await db.schema.dropTable("users").execute();
}
