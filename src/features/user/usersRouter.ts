import express, { Request, Response } from "express"
import { usersService } from "./usersService"
import { ApiErrorType, Paginator, PagingParams, RequestWithBody, RequestWithParams } from "../../common/types/types"
import { basicAuthMiddleware } from "../../common/middleware/basic-auth"
import { userValidators } from "./userValidators"
import { HttpStatus } from "../../common/httpStatus"
import { handleErrorsMiddleware } from "../../common/middleware/handleErrors"
import { isKeyOf, pagingUtil } from "../../common/helpers"
import { usersQueryRepo } from "./usersQueryRepo"
import { exampleUserDocument, UserInputModel, UserSearchParams, UserViewModel } from "./userModels"
import { ObjectId } from "mongodb"
import { resultHelpers } from "../../common/result/helpers"

export const usersRouter = express.Router()

const usersController = {
    async getUsers(req: Request, res: Response<Paginator<UserViewModel>>) {

        const pagingParams = pagingUtil<UserViewModel>(req.query, exampleUserDocument)

        const searchParams: UserSearchParams = {
            searchLoginTerm: typeof req.query.searchLoginTerm === "string" ? req.query.searchLoginTerm : null,
            searchEmailTerm: typeof req.query.searchEmailTerm === "string" ? req.query.searchEmailTerm : null,
        }

        const result = await usersQueryRepo.getUsersWithPagingAndFilter(searchParams, pagingParams)
        res.status(HttpStatus.OK).json(result)
    },

    async createUser(req: RequestWithBody<UserInputModel>, res: Response<UserViewModel | ApiErrorType>) {
        const result = await usersService.createUser(req.body, true)

        if (!resultHelpers.isSuccess(result)) {
            res.status(resultHelpers.resultCodeToHttpException(result.status)).json({ errorsMessages: result.extensions })
            return
        }

        const createdUser = await usersQueryRepo.getUserById(result.data.createdUserId!)
        res.status(HttpStatus.Created).json(createdUser!)
    },

    async deleteUser(req: RequestWithParams<{ id: string }>, res: Response) {
        if (!ObjectId.isValid(req.params.id)) {
            res.sendStatus(HttpStatus.NotFound)
            return
        }

        const deletedUser = await usersService.deleteUser(req.params.id)
        if (!deletedUser) {
            res.sendStatus(HttpStatus.NotFound)
            return
        }
        res.sendStatus(HttpStatus.NoContent)
    },
}

usersRouter.get("/",
    basicAuthMiddleware,
    usersController.getUsers,
)

usersRouter.post("/",
    basicAuthMiddleware,
    ...userValidators,
    handleErrorsMiddleware,
    usersController.createUser,
)

usersRouter.delete("/:id",
    basicAuthMiddleware,
    usersController.deleteUser,
)
