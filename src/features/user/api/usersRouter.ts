import express, { Request, Response } from "express"
import { usersService } from "../application/usersService"
import { ApiErrorType, Paginator, RequestWithBody, RequestWithParams } from "../../../common/types/types"
import { basicAuthMiddleware } from "../../../common/middleware/basic-auth"
import { HttpStatus } from "../../../common/httpStatus"
import { handleErrorsMiddleware } from "../../../common/middleware/handleErrors"
import { pagingUtil } from "../../../common/helpers"
import { usersQueryRepo } from "../infra/usersQueryRepo"
import { exampleUserDocument, UserInputModel, UserSearchParams, UserViewModel } from "../domain/userModels"
import { ObjectId } from "mongodb"
import { resultHelpers } from "../../../common/result/helpers"
import {
    emailValidator,
    registerUserLoginValidator,
    registerUserPasswordValidator,
} from "../../../common/middleware/validators"

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
    registerUserLoginValidator, registerUserPasswordValidator, emailValidator,
    handleErrorsMiddleware,
    usersController.createUser,
)

usersRouter.delete("/:id",
    basicAuthMiddleware,
    usersController.deleteUser,
)
