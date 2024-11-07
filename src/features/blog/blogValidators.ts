import { body, validationResult } from "express-validator"
import { NextFunction, Request, Response } from "express"
import { HttpStatusCodes } from "../../lib/httpStatusCodes"

export const nameValidator = body("name")
    .isString()
    .withMessage("Name should be a string")
    .trim()
    .isLength({ min: 3, max: 15 })
    .withMessage("Name length should be between 3 and 15 characters")
export const descriptionValidator = body("description")
    .isString()
    .withMessage("Description should be a string")
    .trim()
    .isLength({ min: 3, max: 500 })
    .withMessage("Description length should be between 3 and 500 characters")
export const urlValidator = body("websiteUrl")
    .isString()
    .withMessage("Url should be a string")
    .trim()
    .isLength({ max: 100 })
    .withMessage("Max allowed length of url is 100 characters")
    .isURL({ protocols: [ "https" ], require_protocol: true })
    .withMessage("Incorrect url")

export const handleNotFoundError = (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req).array({ onlyFirstError: true })
    if (errors.length > 0) {
        res.sendStatus(HttpStatusCodes.NotFound)
        return
    }
    next()
}

export const blogValidators = [ nameValidator, descriptionValidator, urlValidator ]
