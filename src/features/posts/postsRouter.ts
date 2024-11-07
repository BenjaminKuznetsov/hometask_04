import express, { Request, Response } from "express"
import { examplePostDocument, PostInputModel, PostViewModel } from "./postModels"
import { BlogNotFoundError, postsService } from "./postsService"
import {
    ApiErrorType,
    Paginator,
    PagingParams,
    RequestWithBody,
    RequestWithParams,
    RequestWithParamsAndBody,
} from "../../types"
import { authMiddleware } from "../../middleware/auth"
import { postValidators } from "./postValidators"
import { HttpStatusCodes } from "../../lib/httpStatusCodes"
import { handleErrorsMiddleware } from "../../middleware/handleErrors"
import { formatErrors, isKeyOf } from "../../lib/helpers"
import { postsQueryRepo } from "./postsQueryRepo"

export const postsRouter = express.Router()

const postsController = {
    async getPosts(req: Request, res: Response<Paginator<PostViewModel>>) {

        const pagingParams: PagingParams<PostViewModel> = {
            sortBy: isKeyOf(req.params.sortBy, examplePostDocument)
                ? req.params.sortBy
                : "createdAt",
            sortDirection: req.params.sortDirection === "desc" ? "desc" : "asc",
            pageNumber: Number(req.params.pageNumber) || 1,
            pageSize: Number(req.params.pageSize) || 10,
        }

        const result = await postsQueryRepo.getPostsWithPagingAndFilter({}, pagingParams)
        res.status(HttpStatusCodes.OK).json(result)
    },

    async getPostById(req: RequestWithParams<{ id: string }>, res: Response<PostViewModel>) {
        const foundPost = await postsQueryRepo.getPostById(req.params.id)
        if (!foundPost) {
            res.sendStatus(HttpStatusCodes.NotFound)
        } else {
            res.status(HttpStatusCodes.OK).json(foundPost)
        }
    },
    async createPost(req: RequestWithBody<PostInputModel>, res: Response<PostViewModel | ApiErrorType>) {

        try {
            const createdPost = await postsService.createPost(req.body)
            res.status(HttpStatusCodes.Created).json(createdPost)
        } catch (e: any) {
            if (e instanceof BlogNotFoundError) {
                res.status(HttpStatusCodes.BadRequest).json({
                    errorsMessages: [ {
                        message: e.message,
                        field: "blogId",
                    } ],
                })
                return
            }
            res.sendStatus(HttpStatusCodes.InternalServerError)
        }
    },
    async updatePost(req: RequestWithParamsAndBody<{
        id: string
    }, PostInputModel>, res: Response<null | ApiErrorType>) {
        try {
            const updatedPost = await postsService.updatePost(req.params.id, req.body)
            if (!updatedPost) {
                res.sendStatus(HttpStatusCodes.NotFound)
                return
            }
            res.sendStatus(HttpStatusCodes.NoContent)

        } catch (e: any) {
            if (e instanceof BlogNotFoundError) {
                res.status(HttpStatusCodes.BadRequest).json({
                    errorsMessages: [ {
                        message: e.message,
                        field: "blogId",
                    } ],
                })
                return
            }
            res.sendStatus(HttpStatusCodes.InternalServerError)
        }
    },
    async deletePost(req: RequestWithParams<{ id: string }>, res: Response) {
        const deletedPost = await postsService.deletePost(req.params.id)
        if (!deletedPost) {
            res.sendStatus(HttpStatusCodes.NotFound)
            return
        }
        res.sendStatus(HttpStatusCodes.NoContent)
    },
}

postsRouter.get("/", postsController.getPosts)

postsRouter.get("/:id", postsController.getPostById)

postsRouter.post("/",
    authMiddleware,
    ...postValidators,
    handleErrorsMiddleware,
    postsController.createPost,
)

postsRouter.put("/:id",
    authMiddleware,
    ...postValidators,
    handleErrorsMiddleware,
    postsController.updatePost,
)

postsRouter.delete("/:id", authMiddleware, postsController.deletePost)
