import { Router, Response, Request } from "express"
import { HttpStatus } from "../../common/httpStatus"
import { handleErrorsMiddleware } from "../../common/middleware/handleErrors"
import { RequestWithBody } from "../../common/types/types"
import { authService } from "./auth.service"
import { resultHelpers } from "../../common/result/helpers"
import { loginOrEmailValidator, passwordValidator } from "./auth.validators"
import { AuthInput } from "./auth.types"
import { usersQueryRepo } from "../user/usersQueryRepo"
import { MeViewModel, UserInputModel } from "../user/userModels"
import { bearerAuthMiddleware } from "../../common/middleware/bearer-auth"
import { paths } from "../../common/paths"
import { emailValidator, userValidators } from "../user/userValidators"
import { appConfig } from "../../common/config/config"
import { refreshTokenMiddleware } from "./auth.middlewares"

export const authRouter = Router()

authRouter

    .get(paths.auth.subs.me,
        bearerAuthMiddleware,
        async (req: Request, res: Response<MeViewModel>) => {

            const me = await usersQueryRepo.getMe(req.userId!)

            res.status(HttpStatus.OK).json(me)
        })

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

            res.cookie("refreshToken", result.data.refreshToken, { httpOnly: true, secure: true })
            res.status(HttpStatus.OK).json(result.data)
        })

    .post(paths.auth.subs.refresh,
        refreshTokenMiddleware,
        async (req: Request, res: Response<{ "accessToken": string }>) => {
            const refreshToken: string = req.cookies.refreshToken

            const result = await authService.refreshUserTokens(refreshToken)

            if (!resultHelpers.isSuccess(result)) {
                res.sendStatus(resultHelpers.resultCodeToHttpException(result.status))
                return
            }

            res.cookie(appConfig.cookieNames.refreshToken, result.data.refreshToken, { httpOnly: true, secure: true })
            res.status(HttpStatus.OK).json({ accessToken: result.data.accessToken })
        })

    .post(paths.auth.subs.logout,
        refreshTokenMiddleware,
        async (req: Request, res: Response) => {
            const refreshToken: string = req.cookies.refreshToken

            const result = await authService.logOutUser(refreshToken)

            if (!resultHelpers.isSuccess(result)) {
                res.sendStatus(resultHelpers.resultCodeToHttpException(result.status))
                return
            }

            res.clearCookie(appConfig.cookieNames.refreshToken)
            res.sendStatus(HttpStatus.NoContent)
        })

    .post(paths.auth.subs.register,
        ...userValidators,
        handleErrorsMiddleware,
        async (req: RequestWithBody<UserInputModel>, res: Response) => {

            const result = await authService.registerUser(req.body)

            if (!resultHelpers.isSuccess(result)) {
                res.status(resultHelpers.resultCodeToHttpException(result.status)).json({ errorsMessages: result.extensions })
                return
            }

            res.sendStatus(HttpStatus.NoContent)
        })

    .post(paths.auth.subs.registerConfirm,
        async (req: RequestWithBody<{ code: string }>, res: Response) => {

            const code = req.body.code
            const result = await authService.confirmUserRegistration(code)

            if (!resultHelpers.isSuccess(result)) {
                res.status(resultHelpers.resultCodeToHttpException(result.status)).json({ errorsMessages: result.extensions })
                return
            }

            res.sendStatus(HttpStatus.NoContent)
        })

    .post(paths.auth.subs.registerEmailResend,
        emailValidator,
        handleErrorsMiddleware,
        async (req: RequestWithBody<{ email: string }>, res: Response) => {

            const email = req.body.email

            const result = await authService.resendUserConfirmationEmail(email)

            if (!resultHelpers.isSuccess(result)) {
                res.status(resultHelpers.resultCodeToHttpException(result.status)).json({ errorsMessages: result.extensions })
                return
            }

            res.sendStatus(HttpStatus.NoContent)
        })