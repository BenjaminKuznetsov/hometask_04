import { Router, Response, Request } from "express"
import { DeviceViewModel } from "./sessions.types"
import { bearerAuthMiddleware } from "../../common/middleware/bearer-auth"
import { sessionsService } from "./sessions.service"
import { HttpStatus } from "../../common/httpStatus"

export const sessionsRouter = Router()

sessionsRouter.get("/",
    bearerAuthMiddleware,
    async (req: Request, res: Response<DeviceViewModel[]>) => {
        const userId = req.userId!
        const devices = await sessionsService.getDevices(userId)
        res.status(HttpStatus.OK).json(devices)
    })