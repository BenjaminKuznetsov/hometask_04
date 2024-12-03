import jwt, { JwtPayload } from "jsonwebtoken"
import { appConfig } from "../config/config"
import { ResultType } from "../result/result.type"
import { resultHelpers } from "../result/helpers"

export const jwtService = {
    async createAccessToken(userId: string): Promise<string> {
        return jwt.sign({ userId }, appConfig.jwtSecret, { expiresIn: appConfig.accessTokenExp })
    },
    async createRefreshToken(userId: string): Promise<string> {
        return jwt.sign({ userId }, appConfig.jwtSecret, { expiresIn: appConfig.refreshTokenExp })
    },
    async decodeToken(token: string): Promise<JwtPayload | string | null> {
        return jwt.decode(token)
    },
    async verifyToken(token: string): Promise<ResultType<{ userId: string } | null>> {
        try {
            const result = jwt.verify(token, appConfig.jwtSecret) as JwtPayload as { userId: string }
            return resultHelpers.success({ userId: result.userId })
        } catch (e) {
            return resultHelpers.unauthorized()
        }
    },
}