import type { FastifySchema } from "fastify";
import { z } from "zod";

const bodySchema = z.object({
    email: z.string().email(),
    password: z.string().min(6)
});

export type SignUpSchemaType = z.infer<typeof bodySchema>;
export const signUpFSchema: FastifySchema = { body: bodySchema };
