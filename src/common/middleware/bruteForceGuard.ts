import { NextFunction, Request, Response } from "express"
import { apiRequestsService } from "../../features/utils/api-requests/application/api-requests.service"
import { resultHelpers } from "../result/helpers"
import { HttpStatus } from "../httpStatus"
import { paths } from "../paths"

const endpointsToCheck: string[] = [
    paths.auth.login,
    paths.auth.register,
    paths.auth.registerConfirm,
    paths.auth.registerEmailResend,
    paths.auth.passwordRecovery,
]

export const bruteForceGuard = async (req: Request, res: Response, next: NextFunction) => {
    const url = req.originalUrl

    if (!endpointsToCheck.includes(url)) {
        next()
        return
    }

    const ip = req.ip || ""
    const result = await apiRequestsService.checkTooManyRequests(ip, url)
    if (resultHelpers.isNotSuccess(result)) {
        res.sendStatus(HttpStatus.TooManyRequests)
        return
    }

    next()
}