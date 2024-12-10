import { Request, Response, Router } from "express"
import { DeviceViewModel } from "./sessions.types"
import { bearerAuthMiddleware } from "../../common/middleware/bearer-auth"
import { sessionsService } from "./sessions.service"
import { HttpStatus } from "../../common/httpStatus"
import { resultHelpers } from "../../common/result/helpers"

export const sessionsRouter = Router()

const checkRefreshTokenMiddleware = async (req: Request, res: Response, next: () => void) => {
    const refreshToken: string = req.cookies.refreshToken
    if (!refreshToken) {
        res.sendStatus(HttpStatus.Unauthorized)
        return
    }
    next()
}

sessionsRouter.get("/",
    checkRefreshTokenMiddleware,
    async (req: Request, res: Response<DeviceViewModel[]>) => {
        const result = await sessionsService.getUserDevices(req.cookies.refreshToken)
        if (!resultHelpers.isSuccess(result)) {
            res.sendStatus(HttpStatus.Unauthorized)
            return
        }
        res.status(HttpStatus.OK).json(result.data)
    })

    .delete("/",
        checkRefreshTokenMiddleware,
        async (req: Request, res: Response) => {
            const result = await sessionsService.terminateAllOtherUserSessions(req.cookies.refreshToken)
            if (!resultHelpers.isSuccess(result)) {
                res.sendStatus(HttpStatus.Unauthorized)
                return
            }
            res.sendStatus(HttpStatus.NoContent)
        })

    .delete("/:deviceId",
        checkRefreshTokenMiddleware,
        async (req: Request, res: Response) => {

            const deviceId = req.params.deviceId
            const result = await sessionsService.terminateOneSession(req.cookies.refreshToken, deviceId)

            if (!resultHelpers.isSuccess(result)) {
                res.sendStatus(resultHelpers.resultCodeToHttpException(result.status))
                return
            }

            res.sendStatus(HttpStatus.NoContent)
        })