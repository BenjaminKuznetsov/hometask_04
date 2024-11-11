import { Router, Response } from "express"
import { HttpStatusCodes } from "../../lib/httpStatusCodes"
import { body } from "express-validator"
import { handleErrorsMiddleware } from "../../middleware/handleErrors"
import { usersService } from "../user/usersService"
import { RequestWithBody } from "../../types"

type AuthInput = {
    loginOrEmail: string
    password: string
}

export const authRouter = Router()

const loginOrEmailValidator = body("loginOrEmail").isSlug().trim().notEmpty().withMessage("Login or email is required")
const passwordValidator = body("password").isSlug().trim().notEmpty().withMessage("Password is required")

authRouter.post("/login",
    loginOrEmailValidator,
    passwordValidator,
    handleErrorsMiddleware,
    async (req: RequestWithBody<AuthInput>, res: Response) => {
        const isAuthenticated = await usersService.checkCredentials(req.body.loginOrEmail, req.body.password)

        if (!isAuthenticated) {
            res.sendStatus(HttpStatusCodes.Unauthorized)
            return
        }

        res.sendStatus(HttpStatusCodes.NoContent)
    })