import { NextFunction, Request, Response } from "express"
import { apiRequestsService } from "../../features/utils/api-requests/application/api-requests.service"

export const registrator = async (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip || ""
    const url = req.originalUrl
    await apiRequestsService.saveRequest(ip, url)
    next()
}