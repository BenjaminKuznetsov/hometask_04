import { Request, Response, NextFunction } from "express"
import { HttpStatus } from "../httpStatus"
import { jwtService } from "../adapters/jwt.service"
import { resultHelpers } from "../result/helpers"
import { usersRepo } from "../../features/user/infra/usersRepo"

export const bearerAuthMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization
    if (!authHeader) {
        res.sendStatus(HttpStatus.Unauthorized)
        return
    }

    const token = authHeader.split(" ")[1]

    const result = await jwtService.verifyToken(token)

    if (!resultHelpers.isSuccess(result)) {
        res.sendStatus(HttpStatus.Unauthorized)
        return
    }

    const doesUserExist = await usersRepo.doesExistById(result.data.userId)

    if (!doesUserExist) {
        res.sendStatus(HttpStatus.Unauthorized)
        return
    }

    req.userId = result.data.userId

    next()
}
