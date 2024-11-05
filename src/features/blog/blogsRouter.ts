import express, { Request, Response } from "express"
import { blogsService } from "./blogsService"
import { BlogInputModel, BlogViewModel, BlogSearchParams, exampleBlogDocument } from "./blogModels"
import { Paginator, RequestWithBody, RequestWithParams, RequestWithParamsAndBody } from "../../types"
import { authMiddleware } from "../../middleware/auth"
import { blogIdValidator, blogValidators, handleNotFoundError } from "./blogValidators"
import { HttpStatusCodes } from "../../lib/httpStatusCodes"
import { handleErrorsMiddleware } from "../../middleware/handleErrors"
import { postValidators } from "../posts/postValidators"
import { examplePostDocument, PostInputModel, PostSearchParams, PostViewModel } from "../posts/postModels"
import { postsService } from "../posts/postsService"
import { isKeyOf } from "../../lib/helpers"

export const blogsRouter = express.Router()

const blogsController = {
    async getBlogs(req: Request, res: Response<Paginator<BlogViewModel>>) {

        const queryParams: BlogSearchParams = {
            searchNameTerm: req.params.searchNameTerm || null,
            sortBy: isKeyOf(req.params.sortBy, exampleBlogDocument)
                ? req.params.sortBy
                : "createdAt",
            sortDirection: req.params.sortDirection === "desc" ? "desc" : "asc",
            pageNumber: Number(req.params.pageNumber) || 1,
            pageSize: Number(req.params.pageSize) || 10,
        }

        const result = await blogsService.getBlogs(queryParams)
        res.status(HttpStatusCodes.OK).json(result)
    },
    async getBlogById(req: RequestWithParams<{ id: string }>, res: Response<BlogViewModel>) {
        const foundBlog = await blogsService.getBlogById(req.params.id)
        if (!foundBlog) {
            res.sendStatus(HttpStatusCodes.NotFound)
        } else {
            res.status(HttpStatusCodes.OK).json(foundBlog)
        }
    },
    async getPostsByBlogId(req: Request, res: Response<Paginator<PostViewModel>>) {
        const searchParams: PostSearchParams = {
            blogId: req.params.blogId,
            sortBy: isKeyOf(req.params.sortBy, examplePostDocument)
                ? req.params.sortBy
                : "createdAt",
            sortDirection: req.params.sortDirection === "desc" ? "desc" : "asc",
            pageNumber: Number(req.params.pageNumber) || 1,
            pageSize: Number(req.params.pageSize) || 10,
        }
        const result = await blogsService.getPostsByBlogId(searchParams)
        res.status(HttpStatusCodes.OK).json(result)
    },
    async createPost(req: Request, res: Response<PostViewModel>) {
        const input: PostInputModel = {
            ...req.body,
            blogId: req.params.blogId,
        }
        const createdPost = await postsService.createPost(input)
        res.status(HttpStatusCodes.Created).json(createdPost)
    },
    async createBlog(req: RequestWithBody<BlogInputModel>, res: Response<BlogViewModel>) {
        const createdBlog = await blogsService.createBlog(req.body)
        res.status(HttpStatusCodes.Created).json(createdBlog)
    },
    async updateBlog(
        req: RequestWithParamsAndBody<{ id: string }, BlogInputModel>,
        res: Response<BlogViewModel>,
    ) {
        const updatedBlog = await blogsService.updateBlog(req.params.id, req.body)
        if (!updatedBlog) {
            res.sendStatus(HttpStatusCodes.NotFound)
            return
        }
        res.sendStatus(HttpStatusCodes.NoContent)
    },
    async deleteBlog(req: RequestWithParams<{ id: string }>, res: Response) {
        const deletedBlog = await blogsService.deleteBlog(req.params.id)
        if (!deletedBlog) {
            res.sendStatus(HttpStatusCodes.NotFound)
            return
        }
        res.sendStatus(HttpStatusCodes.NoContent)
    },
}

blogsRouter.get("/", blogsController.getBlogs)

blogsRouter.get("/:id", blogsController.getBlogById)

blogsRouter.get("/:blogId/posts/",
    blogIdValidator,
    handleNotFoundError,
    blogsController.getPostsByBlogId)

blogsRouter.post("/",
    authMiddleware,
    ...blogValidators,
    handleErrorsMiddleware,
    blogsController.createBlog,
)

blogsRouter.post("/:blogId/posts/",
    authMiddleware,
    blogIdValidator,
    handleNotFoundError,
    ...postValidators,
    handleErrorsMiddleware,
    blogsController.createPost,
)

blogsRouter.put("/:id",
    authMiddleware,
    ...blogValidators,
    handleErrorsMiddleware,
    blogsController.updateBlog,
)

blogsRouter.delete("/:id",
    authMiddleware,
    blogsController.deleteBlog,
)
