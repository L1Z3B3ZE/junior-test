import { type Insertable, Kysely, Transaction } from "kysely";
import { UserRoles } from "../../common/enum/user-roles";
import { Albums, DB } from "../../common/types/kysely/db.type";

type InsertableAlbumRowType = Insertable<Albums>;

export async function insert(con: Kysely<DB> | Transaction<DB>, entity: InsertableAlbumRowType) {
    return await con.insertInto("albums").returningAll().values(entity).executeTakeFirstOrThrow();
}

export async function getByTitle(con: Kysely<DB>, title: string, userId: string) {
    return await con.selectFrom("albums").selectAll().where("title", "=", title).where("user_id", "=", userId).executeTakeFirst();
}

export async function getById(con: Kysely<DB> | Transaction<DB>, id: string) {
    return await con.selectFrom("albums").selectAll().where("id", "=", id).executeTakeFirstOrThrow();
}

export async function getAlbums(con: Kysely<DB>, currentUserId: string, currentUserRoleId: number, filterUserId?: string) {
    const selectOptions = ["albums.id", "albums.title", "albums.description", "albums.user_id", "albums.created_at", "users.email as user_email"] as const;
    let query = con.selectFrom("albums").innerJoin("users", "users.id", "albums.user_id").select(selectOptions).orderBy("albums.created_at", "desc");

    if (currentUserRoleId === UserRoles.USER) {
        query = query.where("albums.user_id", "=", currentUserId);
    } else if (currentUserRoleId === UserRoles.ADMIN && filterUserId) {
        query = query.where("albums.user_id", "=", filterUserId);
    }

    return query.execute();
}

export async function getAlbumWithImages(con: Kysely<DB>, albumId: string, currentUserId: string, currentUserRoleId: number) {
    const albumQuery = con
        .selectFrom("albums")
        .selectAll()
        .where("id", "=", albumId)
        .where((eb) =>
            eb.or([
                eb("user_id", "=", currentUserId),
                eb.val(currentUserRoleId === UserRoles.ADMIN),
                eb.exists(eb.selectFrom("shared_albums").select("id").where("album_id", "=", albumId).where("user_id", "=", currentUserId))
            ])
        );
    const imagesQuery = con.selectFrom("images").selectAll().where("album_id", "=", albumId);

    if (currentUserRoleId === UserRoles.USER) {
        imagesQuery.where("user_id", "=", currentUserId);
    }

    const [album, images] = await Promise.all([albumQuery.executeTakeFirst(), imagesQuery.execute()]);

    if (!album) return null;

    return {
        ...album,
        images
    };
}

export async function deleteAlbum(con: Kysely<DB>, albumId: string, currentUserId: string, currentUserRoleId: number) {
    await con
        .deleteFrom("albums")
        .where("id", "=", albumId)
        .where((eb) => (currentUserRoleId === UserRoles.ADMIN ? eb.val(true) : eb("user_id", "=", currentUserId)))
        .execute();
}

export async function shareAlbum(con: Kysely<DB>, albumId: string, sharedWithUserId: string) {
    return await con
        .insertInto("shared_albums")
        .values({
            user_id: sharedWithUserId,
            album_id: albumId
        })
        .returningAll()
        .executeTakeFirstOrThrow();
}

export async function isAlbumOwner(con: Kysely<DB>, albumId: string, userId: string) {
    const album = await con.selectFrom("albums").select("id").where("id", "=", albumId).where("user_id", "=", userId).executeTakeFirst();
    return !!album;
}

export async function isAlreadyShared(con: Kysely<DB>, albumId: string, userId: string) {
    const shared = await con.selectFrom("shared_albums").select("id").where("album_id", "=", albumId).where("user_id", "=", userId).executeTakeFirst();
    return !!shared;
}
