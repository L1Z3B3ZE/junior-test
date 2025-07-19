import type { FastifySchema } from "fastify";
import { z } from "zod";

export const getAlbumsQuerySchema = z.object({
    userId: z.string().uuid().optional()
});

export const getAlbumsFastifySchema: FastifySchema = {
    querystring: getAlbumsQuerySchema
};

export interface IGetAlbumsFastifySchema {
    Querystring: z.infer<typeof getAlbumsQuerySchema>;
}
