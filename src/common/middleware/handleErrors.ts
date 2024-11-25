import { Request, Response, NextFunction } from "express"
import { HttpStatus } from "../httpStatus"
import { formatErrors } from "../helpers"
import { validationResult } from "express-validator"

export const handleErrorsMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req).array({ onlyFirstError: true })
    if (errors.length > 0) {
        res.status(HttpStatus.BadRequest).json({ errorsMessages: errors.map(formatErrors) })
        return
    }
    next()
}
