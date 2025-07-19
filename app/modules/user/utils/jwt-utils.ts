import jwt, { SignOptions } from "jsonwebtoken";
import ms from "ms";

export const generateJwt = (id: string, type: "access" | "refresh") => {
    const secret = type === "refresh" ? process.env.JWT_REFRESH_SECRET! : process.env.JWT_SECRET!;
    const expiresIn = type === "refresh" ? process.env.JWT_REFRESH_SECRET_DURATION! : process.env.JWT_SECRET_DURATION!;

    const options: SignOptions = {
        expiresIn: expiresIn as ms.StringValue
    };

    return jwt.sign({ id, type }, secret, options);
};

export const verifyJwt = (token: string, expectedType: "access" | "refresh") => {
    const secret = expectedType === "refresh" ? process.env.JWT_REFRESH_SECRET! : process.env.JWT_SECRET!;
    return jwt.verify(token, secret) as { id: string; type: string };
};
