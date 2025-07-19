import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { HttpStatusCode } from "../enum/http-status-code";

declare module "fastify" {
    interface FastifyContextConfig {
        isPublic?: boolean;
    }
}

export async function globalAuthHook(fastify: FastifyInstance): Promise<void | FastifyReply> {
    fastify.addHook("onRequest", async function (request: FastifyRequest, reply: FastifyReply) {
        if (request.routeOptions?.config?.isPublic === true) {
            return;
        }

        if (request.url.startsWith("/docs")) {
            return;
        }

        try {
            await request.jwtVerify();

            return;
        } catch {
            return reply.code(HttpStatusCode.UNAUTHORIZED).send({ message: "Unauthorized action" });
        }
    });
}
