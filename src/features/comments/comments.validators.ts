import { body } from "express-validator"

export const commentContentValidator = body("content")
    .isString()
    .withMessage("Content should be a string")
    .trim()
    .isLength({ min: 20, max: 3000 })
    .withMessage("Content length should be between 20 and 3000 characters")
