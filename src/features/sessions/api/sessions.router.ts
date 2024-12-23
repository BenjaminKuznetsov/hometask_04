import { Request, Response, Router } from "express"
import { DeviceViewModel } from "../domain/sessions.model"
import { sessionsService } from "../application/sessions.service"
import { HttpStatus } from "../../../common/httpStatus"
import { resultHelpers } from "../../../common/result/helpers"
import { authService } from "../../auth/application/auth.service"

export const sessionsRouter = Router()

const checkRefreshTokenMiddleware = async (req: Request, res: Response, next: () => void) => {
    const refreshToken: string = req.cookies.refreshToken
    if (!refreshToken) {
        res.sendStatus(HttpStatus.Unauthorized)
        return
    }
    const result = await authService.verifyRefreshToken(refreshToken)
    if (!resultHelpers.isSuccess(result)) {
        res.sendStatus(HttpStatus.Unauthorized)
        return
    }
    req.userCtx = { userId: result.data.userId, deviceId: result.data.deviceId }
    next()
}

sessionsRouter.get("/",
    checkRefreshTokenMiddleware,
    async (req: Request, res: Response<DeviceViewModel[]>) => {
        const { userId } = req.userCtx
        const result = await sessionsService.getUserDevices(userId!)
        if (!resultHelpers.isSuccess(result)) {
            res.sendStatus(HttpStatus.Unauthorized)
            return
        }
        res.status(HttpStatus.OK).json(result.data)
    })

    .delete("/",
        checkRefreshTokenMiddleware,
        async (req: Request, res: Response) => {
            const { userId, deviceId } = req.userCtx
            const result = await sessionsService.terminateAllOtherUserSessions(userId!, deviceId!)
            if (!resultHelpers.isSuccess(result)) {
                res.sendStatus(HttpStatus.Unauthorized)
                return
            }
            res.sendStatus(HttpStatus.NoContent)
        })

    .delete("/:deviceId",
        checkRefreshTokenMiddleware,
        async (req: Request, res: Response) => {
            const { userId } = req.userCtx

            const deviceId = req.params.deviceId
            const result = await sessionsService.terminateOneSession(userId!, deviceId)

            if (!resultHelpers.isSuccess(result)) {
                res.sendStatus(resultHelpers.resultCodeToHttpException(result.status))
                return
            }

            res.sendStatus(HttpStatus.NoContent)
        })