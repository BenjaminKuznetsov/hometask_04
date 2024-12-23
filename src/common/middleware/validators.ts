import { body } from "express-validator"

// common
export const emailValidator = body("email")
    .isString()
    .withMessage("Email should be a string")
    .trim()
    .toLowerCase()
    .matches(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/)
    .withMessage("Incorrect email")

const passwordValidationRules = (validator: ReturnType<typeof body>) =>
    validator
        .isString()
        .withMessage("Password should be a string")
        .trim()
        .isLength({ min: 6, max: 20 })
        .withMessage("Password length should be between 6 and 20 characters")

// register user
export const registerUserLoginValidator = body("login")
    .isString()
    .withMessage("Login should be a string")
    .trim()
    .isLength({ min: 3, max: 10 })
    .withMessage("Login length should be between 3 and 10 characters")
    .matches(/^[a-zA-Z0-9_-]*$/)
    .withMessage("Login should contain only symbols of A-Z, a-z, 0-9, _, -")
export const registerUserPasswordValidator = passwordValidationRules(body("password"))
export const newPasswordValidator = passwordValidationRules(body("newPassword"))

// login user
export const loginOrEmailValidator = body("loginOrEmail")
    .trim()
    .notEmpty()
    .withMessage("Login or email is required")
export const loginUserPasswordValidator = body("password")
    .trim()
    .notEmpty()
    .withMessage("Password is required")

export const recoveryCodeValidator = body("recoveryCode")
    .trim()
    .notEmpty()
    .withMessage("Recovery code is required")
    .isUUID()
    .withMessage("Incorrect recovery code")




