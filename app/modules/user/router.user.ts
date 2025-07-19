import type { FastifyInstance } from "fastify";
import * as userController from "./controller.user";
import { loginFSchema } from "./schemas/login.schema";
import { signUpFSchema } from "./schemas/sign-up.schema";

export const userRouter = async (app: FastifyInstance) => {
    app.post("/sign-up", { schema: signUpFSchema, config: { isPublic: true } }, userController.create);
    app.post("/login", { schema: loginFSchema, config: { isPublic: true } }, userController.login);
};
