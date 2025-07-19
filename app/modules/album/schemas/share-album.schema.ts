import type { FastifySchema } from "fastify";
import { z } from "zod";

export const paramsSchema = z.object({
    id: z.string().uuid()
});

export const bodySchema = z.object({
    userId: z.string().uuid()
});

export const shareAlbumFastifySchema: FastifySchema = {
    params: paramsSchema,
    body: bodySchema
};

export interface IShareAlbumFastifySchema {
    Params: z.infer<typeof paramsSchema>;
    Body: z.infer<typeof bodySchema>;
}
