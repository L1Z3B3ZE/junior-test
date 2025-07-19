import type { FastifySchema } from "fastify";
import { z } from "zod";

export const querySchema = z.object({
    albumId: z.string().uuid().optional(),
    page: z.preprocess((val) => (val === undefined || val === "" ? undefined : Number(val)), z.number().int().positive().default(1)),
    perPage: z.preprocess((val) => (val === undefined || val === "" ? undefined : Number(val)), z.number().int().min(1).max(100).default(20))
});

export const getImagesFastifySchema: FastifySchema = {
    querystring: querySchema
};

export interface IGetImagesFastifySchema {
    Querystring: z.infer<typeof querySchema>;
}
