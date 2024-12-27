import { ApiErrorType, RequestWithParams, RequestWithParamsAndBody } from "../../../common/types/types"
import { Response } from "express"
import { CommentsQueryRepo } from "../infra/comments.queryRepo"
import { HttpStatus } from "../../../common/httpStatus"
import { CommentsService } from "../application/comments.service"
import { resultHelpers } from "../../../common/result/helpers"
import { inject } from "inversify"
import { TCommentInput, TCommentViewModel } from "./comments.dto"
import { LikeInputDTO } from "../../likes/api/likes.dto"

export class CommentsController {
    constructor(
        @inject(CommentsService) private commentsService: CommentsService,
        @inject(CommentsQueryRepo) private commentsQueryRepo: CommentsQueryRepo,
    ) {
    }

    async getById(req: RequestWithParams<{ id: string }>, res: Response<TCommentViewModel>) {
        const id = req.params.id
        const comment = await this.commentsQueryRepo.getCommentById(id)

        if (!comment) {
            res.sendStatus(HttpStatus.NotFound)
            return
        }

        res.status(HttpStatus.OK).json(comment)
    }

    async updateById(req: RequestWithParamsAndBody<{ id: string }, TCommentInput>, res: Response<ApiErrorType | null>) {
        const id = req.params.id
        const input = req.body
        const userId = req.userCtx.userId

        const result = await this.commentsService.editComment(id, userId!, input)

        if (!resultHelpers.isSuccess(result)) {
            res.status(resultHelpers.resultCodeToHttpException(result.status)).json({ errorsMessages: result.extensions })
            return
        }

        res.sendStatus(HttpStatus.NoContent)
    }

    async handleLike(req: RequestWithParamsAndBody<{ commentId: string }, LikeInputDTO>,
                     res: Response<ApiErrorType | null>) {
        const commentId = req.params.commentId
        const userId = req.userCtx.userId
        const input = req.body

        res.sendStatus(HttpStatus.NoContent)
    }

    async deleteById(req: RequestWithParams<{ id: string }>, res: Response) {
        const id = req.params.id
        const userId = req.userCtx.userId

        const result = await this.commentsService.deleteComment(id, userId!)
        if (!resultHelpers.isSuccess(result)) {
            res.status(resultHelpers.resultCodeToHttpException(result.status)).json({ errorsMessages: result.extensions })
            return
        }

        res.sendStatus(HttpStatus.NoContent)
    }
}