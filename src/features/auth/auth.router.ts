import { Router, Response, Request } from "express"
import { HttpStatus } from "../../common/httpStatus"
import { handleErrorsMiddleware } from "../../common/middleware/handleErrors"
import { RequestWithBody } from "../../common/types/types"
import { authService } from "./auth.service"
import { resultHelpers } from "../../common/result/helpers"
import { loginOrEmailValidator, passwordValidator } from "./auth.validators"
import { AuthInput } from "./auth.types"
import { usersQueryRepo } from "../user/usersQueryRepo"
import { MeViewModel } from "../user/userModels"
import { bearerAuthMiddleware } from "../../common/middleware/bearer-auth"
import { paths } from "../../common/paths"

export const authRouter = Router()

authRouter

    .post(paths.auth.subs.login,
        loginOrEmailValidator,
        passwordValidator,
        handleErrorsMiddleware,
        async (req: RequestWithBody<AuthInput>, res: Response<{ "accessToken": string }>) => {
            const result = await authService.loginUser(req.body.loginOrEmail, req.body.password)

            if (!resultHelpers.isSuccess(result)) {
                res.sendStatus(HttpStatus.Unauthorized)
                return
            }

            res.status(HttpStatus.OK).json(result.data)
        })

    .get(paths.auth.subs.me,
        bearerAuthMiddleware,
        async (req: Request, res: Response<MeViewModel>) => {

            const me = await usersQueryRepo.getMe(req.userId!)

            res.status(HttpStatus.OK).json(me)
        })