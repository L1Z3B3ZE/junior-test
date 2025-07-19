import { sqlCon } from "../../../common/config/kysely-config";
import * as tokenRepository from "../repository.token";
import { generateJwt } from "./jwt-utils";

export async function makeTokens(userId: string) {
    const accessToken = generateJwt(userId, "access");
    const refreshToken = generateJwt(userId, "refresh");
    const existingToken = await tokenRepository.getRefreshTokenByUserId(sqlCon, userId);

    if (existingToken) {
        await tokenRepository.updateRefreshToken(sqlCon, existingToken.id, refreshToken);
    } else {
        await tokenRepository.insert(sqlCon, {
            refresh_token: refreshToken,
            user_id: userId,
            expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        });
    }

    return { accessToken, refreshToken };
}
