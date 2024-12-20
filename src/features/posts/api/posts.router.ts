import express, { Request, Response } from "express"
import { examplePostDocument, PostInputModel, PostViewModel } from "../domain/post.model"
import { BlogNotFoundError, postsService } from "../application/postsService"
import {
    ApiErrorType,
    Paginator,
    PagingParams,
    RequestWithBody,
    RequestWithParams,
    RequestWithParamsAndBody,
} from "../../../common/types/types"
import { basicAuthMiddleware } from "../../../common/middleware/basic-auth"
import { blogIdMongoValidator, blogIdValidator, postValidators } from "../midleware/postValidators"
import { HttpStatus } from "../../../common/httpStatus"
import { handleErrorsMiddleware } from "../../../common/middleware/handleErrors"
import { isKeyOf, pagingUtil } from "../../../common/helpers"
import { postsQueryRepo } from "../infra/postsQueryRepo"
import { ObjectId } from "mongodb"
import { bearerAuthMiddleware } from "../../../common/middleware/bearer-auth"
import { commentContentValidator } from "../../comments/midleware/comments.validators"
import { commentsService } from "../../comments/application/comments.service"
import { resultHelpers } from "../../../common/result/helpers"
import { commentsQueryRepo } from "../../comments/infra/comments.queryRepo"
import { exampleCommentDocument, TCommentViewModel } from "../../comments/domain/comments.model"
import { postsRepository } from "../infra/postsRepository"

export const postsRouter = express.Router()

const postsController = {
    async getPosts(req: Request, res: Response<Paginator<PostViewModel>>) {

        const pagingParams = pagingUtil<PostViewModel>(req.query, examplePostDocument)

        const result = await postsQueryRepo.getPostsWithPagingAndFilter({}, pagingParams)
        res.status(HttpStatus.OK).json(result)
    },

    async getPostById(req: RequestWithParams<{ id: string }>, res: Response<PostViewModel>) {
        if (!ObjectId.isValid(req.params.id)) {
            res.sendStatus(HttpStatus.NotFound)
            return
        }

        const foundPost = await postsQueryRepo.getPostById(req.params.id)
        if (!foundPost) {
            res.sendStatus(HttpStatus.NotFound)
        } else {
            res.status(HttpStatus.OK).json(foundPost)
        }
    },

    async createPost(req: RequestWithBody<PostInputModel>, res: Response<PostViewModel | ApiErrorType>) {

        try {
            const createdPostId = await postsService.createPost(req.body)
            const createdPost = await postsQueryRepo.getPostById(createdPostId)
            res.status(HttpStatus.Created).json(createdPost!)
        } catch (e: any) {
            if (e instanceof BlogNotFoundError) {
                res.status(HttpStatus.BadRequest).json({
                    errorsMessages: [ {
                        message: e.message,
                        field: "blogId",
                    } ],
                })
                return
            }
            throw e
        }
    },
    async updatePost(req: RequestWithParamsAndBody<{
        id: string
    }, PostInputModel>, res: Response<null | ApiErrorType>) {
        try {
            const updatedPost = await postsService.updatePost(req.params.id, req.body)
            if (!updatedPost) {
                res.sendStatus(HttpStatus.NotFound)
                return
            }
            res.sendStatus(HttpStatus.NoContent)

        } catch (e: any) {
            if (e instanceof BlogNotFoundError) {
                res.status(HttpStatus.BadRequest).json({
                    errorsMessages: [ {
                        message: e.message,
                        field: "blogId",
                    } ],
                })
                return
            }
            throw e
        }
    },
    async deletePost(req: RequestWithParams<{ id: string }>, res: Response) {
        const deletedPost = await postsService.deletePost(req.params.id)
        if (!deletedPost) {
            res.sendStatus(HttpStatus.NotFound)
            return
        }
        res.sendStatus(HttpStatus.NoContent)
    },

    async getComments(req: RequestWithParams<{ postId: string }>, res: Response) {
        const pagingParams = pagingUtil<TCommentViewModel>(req.query, exampleCommentDocument)

        const postDoesntExist = await postsRepository.doesExistById(req.params.postId)
        if (!postDoesntExist) {
            res.sendStatus(HttpStatus.NotFound)
            return
        }

        const comments = await commentsQueryRepo.getCommentsByPostWithPaging(req.params.postId, pagingParams)
        res.status(HttpStatus.OK).json(comments)
    },

    async createComment(req: RequestWithParams<{ postId: string }>, res: Response) {
        const postId = req.params.postId
        const userId = req.userId
        const result = await commentsService.createComment(postId, userId!, req.body)

        if (!resultHelpers.isSuccess(result)) {
            res.status(resultHelpers.resultCodeToHttpException(result.status)).json({ errorsMessages: result.extensions })
            return
        }

        const createdComment = await commentsQueryRepo.getCommentById(result.data!)
        res.status(HttpStatus.Created).json(createdComment!)
    },
}

postsRouter.get("/", postsController.getPosts)

postsRouter.get("/:id", postsController.getPostById)

postsRouter.get("/:postId/comments",
    postsController.getComments,
)

postsRouter.post("/:postId/comments",
    bearerAuthMiddleware,
    commentContentValidator,
    handleErrorsMiddleware,
    postsController.createComment,
)

postsRouter.post("/",
    basicAuthMiddleware,
    ...postValidators,
    blogIdValidator,
    blogIdMongoValidator,
    handleErrorsMiddleware,
    postsController.createPost,
)

postsRouter.put("/:id",
    basicAuthMiddleware,
    ...postValidators,
    blogIdValidator,
    blogIdMongoValidator,
    handleErrorsMiddleware,
    postsController.updatePost,
)

postsRouter.delete("/:id", basicAuthMiddleware, postsController.deletePost)
