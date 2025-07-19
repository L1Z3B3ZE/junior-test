import { type Kysely, sql } from "kysely";

export async function up(db: Kysely<any>) {
    await db.schema
        .createTable("images")
        .addColumn("id", "uuid", (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
        .addColumn("user_id", "uuid", (col) => col.references("users.id").onDelete("cascade").notNull())
        .addColumn("filename", "varchar(255)", (col) => col.notNull())
        .addColumn("stored_filename", "varchar(255)", (col) => col.unique().notNull())
        .addColumn("mime_type", "varchar(255)", (col) => col.notNull())
        .addColumn("size", "varchar(255)", (col) => col.notNull())
        .addColumn("album_id", "uuid", (col) => col.references("albums.id").onDelete("cascade").notNull())
        .addColumn("created_at", "timestamp", (col) => col.defaultTo(sql`now()`).notNull())
        .execute();
}

export async function down(db: Kysely<any>) {
    await db.schema.dropTable("images").execute();
}
