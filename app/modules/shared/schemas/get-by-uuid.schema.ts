import { FastifySchema } from "fastify";
import { z } from "zod";

const paramsSchema = z.object({
    id: z.string().uuid()
});

export type getByUuidFastifySchemaType = z.infer<typeof paramsSchema>;
export const getByUuidFastifySchema: FastifySchema = { params: paramsSchema };

export interface IGetByUuidFastifySchema {
    Params: z.infer<typeof paramsSchema>;
}
