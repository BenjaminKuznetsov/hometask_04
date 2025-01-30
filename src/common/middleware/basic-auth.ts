import { Request, Response, NextFunction } from "express"
import { HttpStatus } from "../httpStatus"
import { encodeToBase64 } from "../helpers"
import { appConfig } from "../config/config"

const ADMIN_AUTH = appConfig.adminAuth

export const basicAuthMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const receivedToken = req.headers.authorization
    if (!receivedToken) {
        res.sendStatus(HttpStatus.Unauthorized)
        return
    }
    const etalonToken = "Basic " + encodeToBase64(ADMIN_AUTH)
    if (receivedToken !== etalonToken) {
        res.sendStatus(HttpStatus.Unauthorized)
        return
    }
    req.userCtx = {
        userId: null,
    }
    next()
}
