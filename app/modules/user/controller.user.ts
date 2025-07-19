import bcrypt from "bcrypt";
import type { FastifyReply, FastifyRequest } from "fastify";
import type { IHandlingResponseError } from "../../common/config/http-response.ts";
import { sqlCon } from "../../common/config/kysely-config";
import { HandlingErrorType } from "../../common/enum/error-types";
import { HttpStatusCode } from "../../common/enum/http-status-code";
import * as userRepository from "./repository.user";
import type { loginSchema } from "./schemas/login.schema.ts";
import { SignUpSchemaType } from "./schemas/sign-up.schema";
import { makeTokens } from "./utils/make-tokens";

export async function create(req: FastifyRequest<{ Body: SignUpSchemaType }>, rep: FastifyReply) {
    const emailExists = await userRepository.getByEmail(sqlCon, req.body.email);
    if (emailExists) {
        const info: IHandlingResponseError = { type: HandlingErrorType.Unique, property: "email" };
        return rep.code(HttpStatusCode.CONFLICT).send(info);
    }
    const hashPassword = await bcrypt.hash(req.body.password, 5);

    const user = {
        email: req.body.email,
        password: hashPassword
    };

    const insertedUser = await userRepository.insert(sqlCon, user);

    const data = {
        id: insertedUser.id
    };
    return rep.code(HttpStatusCode.OK).send(data);
}

export async function login(req: FastifyRequest<{ Body: loginSchema }>, rep: FastifyReply) {
    const user = await userRepository.getByEmail(sqlCon, req.body.email);
    if (!user) {
        const info: IHandlingResponseError = { type: HandlingErrorType.Found, property: "email" };
        return rep.code(HttpStatusCode.NOT_FOUND).send(info);
    }
    const isPasswordValid = await bcrypt.compare(req.body.password, user.password!);
    if (!isPasswordValid) {
        const info: IHandlingResponseError = { type: HandlingErrorType.Match, property: "password" };
        return rep.code(HttpStatusCode.UNAUTHORIZED).send(info);
    }

    const { accessToken, refreshToken } = await makeTokens(user.id);

    const data = {
        id: user.id,
        accessToken,
        refreshToken
    };

    return rep.code(HttpStatusCode.OK).send(data);
}
