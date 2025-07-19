import { Insertable, Kysely, sql, Transaction } from "kysely";
import { UserRoles } from "../../common/enum/user-roles";
import { DB, Images } from "../../common/types/kysely/db.type";

type InsertableImageRowType = Insertable<Images>;

export async function insert(con: Kysely<DB> | Transaction<DB>, entity: InsertableImageRowType) {
    return await con.insertInto("images").returningAll().values(entity).executeTakeFirstOrThrow();
}

export async function getOne(con: Kysely<DB>, imageId: string, currentUserId: string, currentUserRoleId: number) {
    return await con
        .selectFrom("images")
        .selectAll()
        .leftJoin("albums", "albums.id", "images.album_id")
        .where("images.id", "=", imageId)
        .where((eb) =>
            eb.or([
                eb("images.user_id", "=", currentUserId),
                eb.val(currentUserRoleId === UserRoles.ADMIN),
                eb.exists(
                    eb
                        .selectFrom("shared_albums")
                        .select("shared_albums.id")
                        .whereRef("shared_albums.album_id", "=", "images.album_id")
                        .where("shared_albums.user_id", "=", currentUserId)
                )
            ])
        )
        .executeTakeFirst();
}

export async function getImages(con: Kysely<DB>, currentUserId: string, currentUserRoleId: number, page: number, perPage: number, albumId?: string) {
    const selectOptions = ["id", "filename", "stored_filename", "mime_type", "size", "album_id", "user_id", "created_at"] as const;
    const offset = (page - 1) * perPage;

    let query = con.selectFrom("images").select(selectOptions).orderBy("created_at", "desc").limit(perPage).offset(offset);

    if (currentUserRoleId === UserRoles.USER) {
        query = query.where("user_id", "=", currentUserId);
    }
    if (albumId) {
        query = query.where("album_id", "=", albumId);
    }

    return query.execute();
}

export async function countImages(con: Kysely<DB>, currentUserId: string, currentUserRoleId: number, albumId?: string) {
    let query = con.selectFrom("images").select(sql<number>`count(id)::int`.as("count"));

    if (currentUserRoleId === UserRoles.USER) {
        query = query.where("user_id", "=", currentUserId);
    }

    if (albumId) {
        query = query.where("album_id", "=", albumId);
    }

    const result = await query.executeTakeFirst();
    return result?.count ?? 0;
}

export async function deleteImage(con: Kysely<DB>, imageId: string, currentUserId: string, currentUserRoleId: number) {
    await con
        .deleteFrom("images")
        .where("id", "=", imageId)
        .where((eb) => (currentUserRoleId === UserRoles.ADMIN ? eb.val(true) : eb("user_id", "=", currentUserId)))
        .execute();
}

export async function getById(con: Kysely<DB>, id: string) {
    return con.selectFrom("images").selectAll().where("id", "=", id).executeTakeFirst();
}
