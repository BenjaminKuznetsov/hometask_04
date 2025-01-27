import { NextFunction, Request, Response } from "express"

export function logger(req: Request, res: Response, next: NextFunction) {

    const originalSend = res.send

    res.send = function (responseBody) {
        console.log(
            `${req.method} ${req.originalUrl} ${JSON.stringify(req.body)}`,
            `\nResponse: ${res.statusCode} ${JSON.stringify(responseBody)}`,
        )
        return originalSend.call(this, responseBody)
    }

    next()
}