import type { FastifyInstance } from "fastify";
import { albumRouter } from "./album/router.album";
import { imageRouter } from "./image/router.image";
import { userRouter } from "./user/router.user";

interface IProvider {
    instance: (app: FastifyInstance) => Promise<void>;
    prefix: string;
}

export const HttpProvider: IProvider[] = [
    { instance: userRouter, prefix: "users" },
    { instance: albumRouter, prefix: "albums" },
    { instance: imageRouter, prefix: "images" }
];
