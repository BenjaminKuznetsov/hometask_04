import { NextFunction, Request, Response } from "express"
import { HttpStatus } from "../../common/httpStatus"

export const refreshTokenMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    const refreshToken: string = req.cookies.refreshToken
    if (!refreshToken) {
        res.sendStatus(HttpStatus.Unauthorized)
        return
    }

    next()
}

