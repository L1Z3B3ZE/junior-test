import { FastifyReply, FastifyRequest } from "fastify";
import { IHandlingResponseError } from "../../common/config/http-response";
import { sqlCon } from "../../common/config/kysely-config";
import { HandlingErrorType } from "../../common/enum/error-types";
import { HttpStatusCode } from "../../common/enum/http-status-code";
import { UserRoles } from "../../common/enum/user-roles";
import { IGetByUuidFastifySchema } from "../shared/schemas/get-by-uuid.schema";
import * as userRepository from "../user/repository.user";
import * as albumRepository from "./repository.album";
import { CreateAlbumSchemaType } from "./schemas/create-album.schema";
import { IGetAlbumsFastifySchema } from "./schemas/get-albums.schema";
import { IShareAlbumFastifySchema } from "./schemas/share-album.schema";

export async function create(req: FastifyRequest<{ Body: CreateAlbumSchemaType }>, rep: FastifyReply) {
    const existingAlbum = await albumRepository.getByTitle(sqlCon, req.body.title, req.user.id!);
    if (existingAlbum) {
        const errorResponse: IHandlingResponseError = {
            type: HandlingErrorType.Unique,
            property: "title",
            message: "An album with that name already exists"
        };
        return rep.code(HttpStatusCode.CONFLICT).send(errorResponse);
    }

    const album = await albumRepository.insert(sqlCon, {
        title: req.body.title,
        description: req.body.description,
        user_id: req.user.id!
    });

    return rep.code(HttpStatusCode.CREATED).send(album);
}

export async function getAlbums(req: FastifyRequest<IGetAlbumsFastifySchema>, rep: FastifyReply) {
    const { userId } = req.query;

    const currentUserRoleId = await userRepository.getUserRole(sqlCon, req.user.id!);

    if (currentUserRoleId === UserRoles.USER && userId) {
        const error: IHandlingResponseError = {
            type: HandlingErrorType.Allowed,
            message: "Only admins can filter by other users"
        };
        return rep.code(HttpStatusCode.FORBIDDEN).send(error);
    }

    const albums = await albumRepository.getAlbums(sqlCon, req.user.id!, currentUserRoleId, req.query.userId);

    return rep.code(HttpStatusCode.OK).send({
        data: albums
    });
}

export async function getOne(req: FastifyRequest<IGetByUuidFastifySchema>, rep: FastifyReply) {
    const currentUserRoleId = await userRepository.getUserRole(sqlCon, req.user.id!);
    const album = await albumRepository.getAlbumWithImages(sqlCon, req.params.id, req.user.id!, currentUserRoleId);

    if (!album) {
        const error: IHandlingResponseError = {
            type: HandlingErrorType.Found,
            property: "album",
            message: "Album not found or access denied"
        };
        return rep.code(HttpStatusCode.NOT_FOUND).send(error);
    }

    return rep.code(HttpStatusCode.OK).send(album);
}

export async function deleteAlbum(req: FastifyRequest<IGetByUuidFastifySchema>, rep: FastifyReply) {
    const album = await albumRepository.getById(sqlCon, req.params.id);
    if (!album) {
        const error: IHandlingResponseError = {
            type: HandlingErrorType.Found,
            property: "album",
            message: "Album not found"
        };
        return rep.code(HttpStatusCode.NOT_FOUND).send(error);
    }
    const currentUserRoleId = await userRepository.getUserRole(sqlCon, req.user.id!);
    if (currentUserRoleId !== UserRoles.ADMIN && album.user_id !== req.user.id) {
        const error: IHandlingResponseError = {
            type: HandlingErrorType.Allowed,
            property: "album",
            message: "You can't delete other users' albums"
        };
        return rep.code(HttpStatusCode.FORBIDDEN).send(error);
    }

    await albumRepository.deleteAlbum(sqlCon, req.params.id, req.user.id!, currentUserRoleId);

    return rep.code(HttpStatusCode.NO_CONTENT).send();
}

export async function shareAlbum(req: FastifyRequest<IShareAlbumFastifySchema>, rep: FastifyReply) {
    const user = await userRepository.getById(sqlCon, req.body.userId);
    if (!user) {
        const error: IHandlingResponseError = {
            type: HandlingErrorType.Found,
            property: "user",
            message: "User is not found"
        };
        return rep.code(HttpStatusCode.NOT_FOUND).send(error);
    }

    const isOwner = await albumRepository.isAlbumOwner(sqlCon, req.params.id, req.user.id!);
    if (!isOwner) {
        const error: IHandlingResponseError = {
            type: HandlingErrorType.Allowed,
            property: "album",
            message: "You're not the owner of this album"
        };
        return rep.code(HttpStatusCode.FORBIDDEN).send(error);
    }

    const shared = await albumRepository.isAlreadyShared(sqlCon, req.params.id, req.body.userId);

    if (shared) {
        const error: IHandlingResponseError = {
            type: HandlingErrorType.Allowed,
            property: "album",
            message: "Album already shared with this user"
        };
        return rep.code(HttpStatusCode.FORBIDDEN).send(error);
    }

    const sharedAlbum = await albumRepository.shareAlbum(sqlCon, req.params.id, req.body.userId);

    return rep.code(HttpStatusCode.CREATED).send(sharedAlbum);
}
