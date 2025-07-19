import type { FastifySchema } from "fastify";
import { z } from "zod";

const schema = z.object({
    email: z.string().email(),
    password: z.string().min(6)
});

export type loginSchema = z.infer<typeof schema>;
export const loginFSchema: FastifySchema = { body: schema };
