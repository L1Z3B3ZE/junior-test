import { type Insertable, type Kysely, Transaction } from "kysely";
import { DB, Users } from "../../common/types/kysely/db.type";

type InsertableUserRowType = Insertable<Users>;

export async function insert(con: Kysely<DB> | Transaction<DB>, entity: InsertableUserRowType) {
    return await con.insertInto("users").returningAll().values(entity).executeTakeFirstOrThrow();
}

export async function getByEmail(con: Kysely<DB>, email: string) {
    return await con.selectFrom("users").selectAll().where("email", "=", email).executeTakeFirst();
}

export async function getById(con: Kysely<DB> | Transaction<DB>, id: string) {
    return await con.selectFrom("users").selectAll().where("id", "=", id).executeTakeFirstOrThrow();
}

export async function getUserRole(con: Kysely<DB>, userId: string): Promise<number> {
    const result = await con.selectFrom("users").select("role_id").where("id", "=", userId).executeTakeFirstOrThrow();

    return result.role_id;
}
