import { FastifyReply, FastifyRequest } from "fastify";
import { randomUUID } from "node:crypto";
import { promises as fs } from "node:fs"; // Используем promises API
import path from "node:path";
import { IHandlingResponseError } from "../../common/config/http-response";
import { sqlCon } from "../../common/config/kysely-config";
import { HandlingErrorType } from "../../common/enum/error-types";
import { HttpStatusCode } from "../../common/enum/http-status-code";
import { UserRoles } from "../../common/enum/user-roles";
import * as albumRepository from "../album/repository.album";
import { IGetByUuidFastifySchema } from "../shared/schemas/get-by-uuid.schema";
import * as userRepository from "../user/repository.user";
import * as imageRepository from "./repository.image";
import { IGetImagesFastifySchema } from "./schemas/get-images.schema";
import { IUploadImageFastifySchema } from "./schemas/upload-image.schema";

export async function uploadImage(req: FastifyRequest<IUploadImageFastifySchema>, rep: FastifyReply) {
    const { albumId } = req.params;
    const { fileBuffer, fileData } = req.body;

    const album = await albumRepository.getById(sqlCon, albumId);
    if (!album) {
        const error: IHandlingResponseError = {
            type: HandlingErrorType.Found,
            property: "album",
            message: "Album not found"
        };
        return rep.code(HttpStatusCode.NOT_FOUND).send(error);
    }

    if (album.user_id !== req.user.id) {
        const error: IHandlingResponseError = {
            type: HandlingErrorType.Allowed,
            message: "You don't have permission to upload to this album"
        };
        return rep.code(HttpStatusCode.FORBIDDEN).send(error);
    }

    const fileExt = path.extname(fileData.filename);
    const storedFilename = `${randomUUID()}${fileExt}`;
    const uploadDir = path.join(process.cwd(), "uploads");
    const filePath = path.join(uploadDir, storedFilename);

    await fs.mkdir(uploadDir, { recursive: true });

    await fs.writeFile(filePath, fileBuffer);

    const image = await imageRepository.insert(sqlCon, {
        user_id: req.user.id!,
        filename: fileData.filename,
        stored_filename: storedFilename,
        mime_type: fileData.mimetype,
        size: fileBuffer.byteLength.toString(),
        album_id: albumId
    });

    return rep.code(HttpStatusCode.CREATED).send({
        id: image.id,
        filename: image.filename,
        storedFilename: image.stored_filename,
        mimeType: image.mime_type,
        size: image.size,
        createdAt: image.created_at
    });
}

export async function getImages(req: FastifyRequest<IGetImagesFastifySchema>, rep: FastifyReply) {
    const { albumId, page, perPage } = req.query;
    const currentUserId = req.user.id!;
    const currentUserRoleId = await userRepository.getUserRole(sqlCon, req.user.id!);

    const images = await imageRepository.getImages(sqlCon, currentUserId, currentUserRoleId, page, perPage, albumId);

    const total = await imageRepository.countImages(sqlCon, currentUserId, currentUserRoleId, albumId);

    const totalPages = Math.ceil(total / perPage);

    return rep.code(HttpStatusCode.OK).send({
        data: images,
        meta: {
            pagination: {
                total,
                totalPages,
                currentPage: page,
                perPage,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1
            },
            filters: {
                albumId
            }
        }
    });
}

export async function getOne(req: FastifyRequest<IGetByUuidFastifySchema>, rep: FastifyReply) {
    const currentUserRoleId = await userRepository.getUserRole(sqlCon, req.user.id!);
    const image = await imageRepository.getOne(sqlCon, req.params.id, req.user.id!, currentUserRoleId);

    if (!image) {
        const info = {
            type: HandlingErrorType.Found,
            property: "image",
            message: "Image not found or access denied"
        };
        return rep.code(HttpStatusCode.NOT_FOUND).send(info);
    }

    return rep.code(HttpStatusCode.OK).send(image);
}

export async function deleteImage(req: FastifyRequest<IGetByUuidFastifySchema>, rep: FastifyReply) {
    const image = await imageRepository.getById(sqlCon, req.params.id);

    if (!image) {
        const error: IHandlingResponseError = {
            type: HandlingErrorType.Found,
            property: "image",
            message: "Image not found"
        };
        return rep.code(HttpStatusCode.NOT_FOUND).send(error);
    }

    const currentUserRoleId = await userRepository.getUserRole(sqlCon, req.user.id!);

    if (currentUserRoleId !== UserRoles.ADMIN && image.user_id !== req.user.id) {
        const error: IHandlingResponseError = {
            type: HandlingErrorType.Allowed,
            property: "image",
            message: "You can't delete other users' images"
        };
        return rep.code(HttpStatusCode.FORBIDDEN).send(error);
    }

    await imageRepository.deleteImage(sqlCon, req.params.id, req.user.id!, currentUserRoleId);

    return rep.code(HttpStatusCode.NO_CONTENT).send();
}
