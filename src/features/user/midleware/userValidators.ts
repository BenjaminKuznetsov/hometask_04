import { body, param } from "express-validator"

export const loginValidator = body("login")
    .isString()
    .withMessage("Login should be a string")
    .trim()
    .isLength({ min: 3, max: 10 })
    .withMessage("Login length should be between 3 and 10 characters")
    .matches(/^[a-zA-Z0-9_-]*$/)
    .withMessage("Login should contain only symbols of A-Z, a-z, 0-9, _, -")

export const passwordValidator = body("password")
    .isString()
    .withMessage("Password should be a string")
    .trim()
    .isLength({ min: 6, max: 20 })
    .withMessage("Password length should be between 6 and 200 characters")

export const emailValidator = body("email")
    .isString()
    .withMessage("Email should be a string")
    .trim()
    .toLowerCase()
    .matches(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/)
    .withMessage("Incorrect email")

export const userValidators = [ loginValidator, passwordValidator, emailValidator ]
