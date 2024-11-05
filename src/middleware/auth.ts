import { Request, Response, NextFunction } from "express"
import { HttpStatusCodes } from "../lib/httpStatusCodes"
import { encodeToBase64 } from "../lib/helpers"

const ADMIN_AUTH = "admin:qwerty"

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const recievedToken = req.headers.authorization
  if (!recievedToken) {
    res.sendStatus(HttpStatusCodes.Unauthorized)
    return
  }
  const etalonToken = "Basic " + encodeToBase64(ADMIN_AUTH)
  if (recievedToken !== etalonToken) {
    res.sendStatus(HttpStatusCodes.Unauthorized)
    return
  }
  next()
}
