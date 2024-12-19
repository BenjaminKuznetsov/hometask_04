import { Router, Request, Response } from "express"
import { commentsQueryRepo } from "./comments.queryRepo"
import { TCommentInput, TCommentViewModel } from "./comments.model"
import { HttpStatus } from "../../common/httpStatus"
import { ApiErrorType, RequestWithParams, RequestWithParamsAndBody } from "../../common/types/types"
import { bearerAuthMiddleware } from "../../common/middleware/bearer-auth"
import { commentContentValidator } from "./comments.validators"
import { handleErrorsMiddleware } from "../../common/middleware/handleErrors"
import { commentsService } from "./comments.service"
import { resultHelpers } from "../../common/result/helpers"

export const commentsRouter = Router()

commentsRouter

    .get("/:id", async (req: RequestWithParams<{ id: string }>, res: Response<TCommentViewModel>) => {
        const id = req.params.id
        const comment = await commentsQueryRepo.getCommentById(id)

        if (!comment) {
            res.sendStatus(HttpStatus.NotFound)
            return
        }

        res.status(HttpStatus.OK).json(comment)
    })

    .put("/:id",
        bearerAuthMiddleware,
        commentContentValidator,
        handleErrorsMiddleware,
        async (req: RequestWithParamsAndBody<{ id: string }, TCommentInput>, res: Response<ApiErrorType | null>) => {
            const id = req.params.id
            const input = req.body
            const userId = req.userId

            const result = await commentsService.editComment(id, userId!, input)

            if (!resultHelpers.isSuccess(result)) {
                res.status(resultHelpers.resultCodeToHttpException(result.status)).json({ errorsMessages: result.extensions })
                return
            }

            res.sendStatus(HttpStatus.NoContent)

        })

    .delete("/:id",
        bearerAuthMiddleware,
        async (req: RequestWithParams<{ id: string }>, res: Response) => {
            const id = req.params.id
            const userId = req.userId

            const result = await commentsService.deleteComment(id, userId!)

            if (!resultHelpers.isSuccess(result)) {
                res.status(resultHelpers.resultCodeToHttpException(result.status)).json({ errorsMessages: result.extensions })
                return
            }

            res.sendStatus(HttpStatus.NoContent)
        })