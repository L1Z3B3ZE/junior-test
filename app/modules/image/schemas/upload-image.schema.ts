import type { FastifySchema } from "fastify";
import { z } from "zod";

export const fileDataSchema = z.object({
    filename: z.string(),
    mimetype: z.string(),
    encoding: z.string(),
    fieldname: z.string()
});

export const bodySchema = z.object({
    fileBuffer: z.custom<Buffer>((val) => Buffer.isBuffer(val)),
    fileData: fileDataSchema
});

export const paramsSchema = z.object({
    albumId: z.string().uuid()
});

export const uploadImageFastifySchema: FastifySchema = {
    params: paramsSchema,
    body: bodySchema
};

export interface IUploadImageFastifySchema {
    Params: z.infer<typeof paramsSchema>;
    Body: z.infer<typeof bodySchema>;
}
