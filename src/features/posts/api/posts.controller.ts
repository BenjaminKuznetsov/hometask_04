import { Request, Response } from "express"
import {
    ApiErrorType,
    Paginator,
    RequestWithBody,
    RequestWithParams,
    RequestWithParamsAndBody,
} from "../../../common/types/types"
import { examplePostDocument, PostInputModel, PostViewModel } from "../domain/post.model"
import { pagingUtil } from "../../../common/helpers"
import { PostsQueryRepo } from "../infra/posts.queryRepo"
import { HttpStatus } from "../../../common/httpStatus"
import { ObjectId } from "mongodb"
import { PostsService } from "../application/posts.service"
import { exampleCommentDocument, TCommentViewModel } from "../../comments/domain/comments.model"
import { PostsRepository } from "../infra/posts.repo"
import { resultHelpers } from "../../../common/result/helpers"
import { CommentsService } from "../../comments/application/comments.service"
import { CommentsQueryRepo } from "../../comments/infra/comments.queryRepo"
import { ResultStatus } from "../../../common/result/result.type"

export class PostsController {
    constructor(
        private postsService: PostsService,
        private postsRepository: PostsRepository,
        private postsQueryRepo: PostsQueryRepo,
        private commentsService: CommentsService,
        private commentsQueryRepo: CommentsQueryRepo,
    ) {
    }

    async getPosts(req: Request, res: Response<Paginator<PostViewModel>>) {

        const pagingParams = pagingUtil<PostViewModel>(req.query, examplePostDocument)

        const result = await this.postsQueryRepo.getPostsWithPagingAndFilter({}, pagingParams)
        res.status(HttpStatus.OK).json(result)
    }

    async getPostById(req: RequestWithParams<{ id: string }>, res: Response<PostViewModel>) {
        if (!ObjectId.isValid(req.params.id)) {
            res.sendStatus(HttpStatus.NotFound)
            return
        }

        const foundPost = await this.postsQueryRepo.getPostById(req.params.id)
        if (!foundPost) {
            res.sendStatus(HttpStatus.NotFound)
        } else {
            res.status(HttpStatus.OK).json(foundPost)
        }
    }

    async createPost(req: RequestWithBody<PostInputModel>, res: Response<PostViewModel | ApiErrorType>) {

        const result = await this.postsService.createPost(req.body)

        if (!resultHelpers.isSuccess(result)) {
            res.status(HttpStatus.BadRequest).json({
                errorsMessages: [ {
                    message: "Blog not found",
                    field: "blogId",
                } ],
            })
            return
        }

        const createdPost = await this.postsQueryRepo.getPostById(result.data)
        res.status(HttpStatus.Created).json(createdPost!)
    }

    async updatePost(req: RequestWithParamsAndBody<{
        id: string
    }, PostInputModel>, res: Response<null | ApiErrorType>) {

        const result = await this.postsService.updatePost(req.params.id, req.body)

        if (!resultHelpers.isSuccess(result)) {
            if (result.status === ResultStatus.NotFound && result.extensions[0]?.field === "blogId") {
                res.status(HttpStatus.BadRequest).json({ errorsMessages: result.extensions })
                return
            }

            res.status(resultHelpers.resultCodeToHttpException(result.status)).json({ errorsMessages: result.extensions })
            return
        }

        res.sendStatus(HttpStatus.NoContent)
    }

    async deletePost(req: RequestWithParams<{ id: string }>, res: Response) {
        const deletedPost = await this.postsService.deletePost(req.params.id)
        if (!deletedPost) {
            res.sendStatus(HttpStatus.NotFound)
            return
        }
        res.sendStatus(HttpStatus.NoContent)
    }

    async getComments(req: RequestWithParams<{ postId: string }>, res: Response) {
        const pagingParams = pagingUtil<TCommentViewModel>(req.query, exampleCommentDocument)

        const postDoesntExist = await this.postsRepository.doesExistById(req.params.postId)
        if (!postDoesntExist) {
            res.sendStatus(HttpStatus.NotFound)
            return
        }

        const comments = await this.commentsQueryRepo.getCommentsByPostWithPaging(req.params.postId, pagingParams)
        res.status(HttpStatus.OK).json(comments)
    }

    async createComment(req: RequestWithParams<{ postId: string }>, res: Response) {
        const postId = req.params.postId
        const userId = req.userCtx.userId
        const result = await this.commentsService.createComment(postId, userId!, req.body)

        if (!resultHelpers.isSuccess(result)) {
            res.status(resultHelpers.resultCodeToHttpException(result.status)).json({ errorsMessages: result.extensions })
            return
        }

        const createdComment = await this.commentsQueryRepo.getCommentById(result.data!)
        res.status(HttpStatus.Created).json(createdComment!)
    }
}