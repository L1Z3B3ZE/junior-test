import { type Kysely } from "kysely";

export async function up(db: Kysely<any>) {
    await db.schema
        .createTable("roles")
        .addColumn("id", "serial", (col) => col.primaryKey())
        .addColumn("name", "varchar(255)", (col) => col.unique().notNull())
        .execute();

    await db
        .insertInto("roles")
        .values([{ name: "admin" }, { name: "user" }])
        .execute();
}

export async function down(db: Kysely<any>) {
    await db.schema.dropTable("roles").execute();
}
