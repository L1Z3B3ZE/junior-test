import type { FastifySchema } from "fastify";
import { z } from "zod";

const bodySchema = z.object({
    title: z.string(),
    description: z.string().optional()
});

export type CreateAlbumSchemaType = z.infer<typeof bodySchema>;
export const createAlbumFSchema: FastifySchema = { body: bodySchema };
