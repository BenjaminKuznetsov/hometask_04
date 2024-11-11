import express, { Request, Response } from "express"
import { usersService } from "./usersService"
import { ApiErrorType, Paginator, PagingParams, RequestWithBody, RequestWithParams } from "../../types"
import { authMiddleware } from "../../middleware/auth"
import { userValidators } from "./userValidators"
import { HttpStatusCodes } from "../../lib/httpStatusCodes"
import { handleErrorsMiddleware } from "../../middleware/handleErrors"
import { isKeyOf } from "../../lib/helpers"
import { usersQueryRepo } from "./usersQueryRepo"
import { exampleUserDocument, UserInputModel, UserSearchParams, UserViewModel } from "./userModels"
import { ObjectId } from "mongodb"

export const usersRouter = express.Router()

const usersController = {
    async getUsers(req: Request, res: Response<Paginator<UserViewModel>>) {

        const pagingParams: PagingParams<UserViewModel> = {
            sortBy: isKeyOf(req.query.sortBy, exampleUserDocument)
                ? req.query.sortBy
                : "createdAt",
            sortDirection: req.query.sortDirection === "asc" ? "asc" : "desc",
            pageNumber: !!req.query.pageNumber && Number(req.query.pageNumber) > 0 ? Number(req.query.pageNumber) : 1,
            pageSize: !!req.query.pageSize && Number(req.query.pageSize) > 0 ? Number(req.query.pageSize) : 10,
        }

        const searchParams: UserSearchParams = {
            searchLoginTerm: typeof req.query.searchLoginTerm === "string" ? req.query.searchLoginTerm : null,
            searchEmailTerm: typeof req.query.searchEmailTerm === "string" ? req.query.searchEmailTerm : null,
        }

        const result = await usersQueryRepo.getUsersWithPagingAndFilter(searchParams, pagingParams)
        res.status(HttpStatusCodes.OK).json(result)
    },

    async createUser(req: RequestWithBody<UserInputModel>, res: Response<UserViewModel | ApiErrorType>) {
        const result = await usersService.createUser(req.body)

        if (result.status === "error") {
            const requestMessage: ApiErrorType = {
                errorsMessages: [
                    {
                        message: result.message!,
                        field: result.field!,
                    },
                ],
            }
            res.status(HttpStatusCodes.BadRequest).json(requestMessage)
            return
        }

        if (result.status === "success") {
            const createdUser = await usersQueryRepo.getUserById(result.createdUserId!)
            res.status(HttpStatusCodes.Created).json(createdUser!)
        }
    },

    async deleteUser(req: RequestWithParams<{ id: string }>, res: Response) {
        if (!ObjectId.isValid(req.params.id)) {
            res.sendStatus(HttpStatusCodes.NotFound)
            return
        }
        
        const deletedUser = await usersService.deleteUser(req.params.id)
        if (!deletedUser) {
            res.sendStatus(HttpStatusCodes.NotFound)
            return
        }
        res.sendStatus(HttpStatusCodes.NoContent)
    },
}

usersRouter.get("/",
    authMiddleware,
    usersController.getUsers,
)

usersRouter.post("/",
    authMiddleware,
    ...userValidators,
    handleErrorsMiddleware,
    usersController.createUser,
)

usersRouter.delete("/:id",
    authMiddleware,
    usersController.deleteUser,
)
