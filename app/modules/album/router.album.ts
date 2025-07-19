import type { FastifyInstance } from "fastify";
import { getByUuidFastifySchema } from "../shared/schemas/get-by-uuid.schema";
import * as albumController from "./controller.album";
import { createAlbumFSchema } from "./schemas/create-album.schema";
import { getAlbumsFastifySchema } from "./schemas/get-albums.schema";
import { shareAlbumFastifySchema } from "./schemas/share-album.schema";

export const albumRouter = async (app: FastifyInstance) => {
    app.post("/", { schema: createAlbumFSchema }, albumController.create);
    app.get("/", { schema: getAlbumsFastifySchema }, albumController.getAlbums);
    app.get("/:id", { schema: getByUuidFastifySchema }, albumController.getOne);
    app.delete("/:id", { schema: getByUuidFastifySchema }, albumController.deleteAlbum);
    app.post("/:id/share", { schema: shareAlbumFastifySchema }, albumController.shareAlbum);
};
