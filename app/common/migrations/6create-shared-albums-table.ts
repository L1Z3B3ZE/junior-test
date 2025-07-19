import { type Kysely, sql } from "kysely";

export async function up(db: Kysely<any>) {
    await db.schema
        .createTable("shared_albums")
        .addColumn("id", "uuid", (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
        .addColumn("user_id", "uuid", (col) => col.references("users.id").onDelete("cascade").notNull())
        .addColumn("album_id", "uuid", (col) => col.references("albums.id").onDelete("cascade").notNull())
        .execute();
}

export async function down(db: Kysely<any>) {
    await db.schema.dropTable("shared_albums").execute();
}
