import { Insertable, type Kysely, Selectable, sql, Transaction } from "kysely";
import { DB, RefreshTokens } from "../../common/types/kysely/db.type";

type InsertableTokenRowType = Insertable<RefreshTokens>;
export type AdminPersonalRefreshTokenType = Selectable<DB["refresh_tokens"]>;

export async function insert(con: Kysely<DB> | Transaction<DB>, entity: InsertableTokenRowType) {
    return await con.insertInto("refresh_tokens").returningAll().values(entity).executeTakeFirstOrThrow();
}

export async function getRefreshTokenByUserId(con: Kysely<DB> | Transaction<DB>, userId: string) {
    return con.selectFrom("refresh_tokens").where("user_id", "=", userId).selectAll().executeTakeFirst();
}

export async function updateRefreshToken(con: Kysely<DB> | Transaction<DB>, tokenId: string, newRefreshToken: string) {
    await con
        .updateTable("refresh_tokens")
        .set({
            refresh_token: newRefreshToken,
            expires_at: sql`now() + INTERVAL '30 days'`
        })
        .where("id", "=", tokenId)
        .execute();
}
