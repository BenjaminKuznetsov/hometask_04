import express, { Request, Response } from "express"
import { examplePostDocument, PostInputModel, PostSearchParams, PostViewModel } from "./postModels"
import { postsService } from "./postsService"
import { Paginator, RequestWithBody, RequestWithParams, RequestWithParamsAndBody } from "../../types"
import { authMiddleware } from "../../middleware/auth"
import { postValidators } from "./postValidators"
import { HttpStatusCodes } from "../../lib/httpStatusCodes"
import { handleErrorsMiddleware } from "../../middleware/handleErrors"
import { isKeyOf } from "../../lib/helpers"

export const postsRouter = express.Router()

const postsController = {
    async getPosts(req: Request, res: Response<Paginator<PostViewModel>>) {

        const queryParams: PostSearchParams = {
            sortBy: isKeyOf(req.params.sortBy, examplePostDocument)
                ? req.params.sortBy
                : "createdAt",
            sortDirection: req.params.sortDirection === "desc" ? "desc" : "asc",
            pageNumber: Number(req.params.pageNumber) || 1,
            pageSize: Number(req.params.pageSize) || 10,
        }

        const result = await postsService.getPosts(queryParams)
        res.status(HttpStatusCodes.OK).json(result)
    },

    async getPostById(req: RequestWithParams<{ id: string }>, res: Response<PostViewModel>) {
        const foundPost = await postsService.getPostById(req.params.id)
        if (!foundPost) {
            res.sendStatus(HttpStatusCodes.NotFound)
        } else {
            res.status(HttpStatusCodes.OK).json(foundPost)
        }
    },
    async createPost(req: RequestWithBody<PostInputModel>, res: Response<PostViewModel>) {
        const createdPost = await postsService.createPost(req.body)
        res.status(HttpStatusCodes.Created).json(createdPost)
    },
    async updatePost(req: RequestWithParamsAndBody<{ id: string }, PostInputModel>, res: Response<PostViewModel>) {
        const updatedPost = await postsService.updatePost(req.params.id, req.body)
        if (!updatedPost) {
            res.sendStatus(HttpStatusCodes.NotFound)
            return
        }
        res.sendStatus(HttpStatusCodes.NoContent)
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
