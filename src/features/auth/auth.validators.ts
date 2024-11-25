import { body } from "express-validator"

export const loginOrEmailValidator = body("loginOrEmail").isSlug().trim().notEmpty().withMessage("Login or email is" +
    " required")

export const passwordValidator = body("password").isSlug().trim().notEmpty().withMessage("Password is required")