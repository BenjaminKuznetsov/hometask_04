import express, { Request, Response } from "express"
import { blogsService } from "./blogsService"
import { BlogInputModel, BlogSearchParams, BlogViewModel, exampleBlogDocument } from "./blogModels"
import { Paginator, PagingParams, RequestWithBody, RequestWithParams, RequestWithParamsAndBody } from "../../types"
import { authMiddleware } from "../../middleware/auth"
import { blogValidators, handleNotFoundError } from "./blogValidators"
import { HttpStatusCodes } from "../../lib/httpStatusCodes"
import { handleErrorsMiddleware } from "../../middleware/handleErrors"
import { postValidators } from "../posts/postValidators"
import { examplePostDocument, PostInputModel, PostSearchParams, PostViewModel } from "../posts/postModels"
import { BlogNotFoundError, postsService } from "../posts/postsService"
import { isKeyOf } from "../../lib/helpers"
import { blogsQueryRepo } from "./blogsQueryRepo"
import { postsQueryRepo } from "../posts/postsQueryRepo"
import { blogsRepository } from "./blogsRepository"
import { ObjectId } from "mongodb"

export const blogsRouter = express.Router()

const blogsController = {
    async getBlogs(req: Request, res: Response<Paginator<BlogViewModel>>) {

        // console.log(req.params)
        // console.log("req.query", req.query)

        const pagingParams: PagingParams<BlogViewModel> = {
            sortBy: isKeyOf(req.query.sortBy, exampleBlogDocument)
                ? req.query.sortBy
                : "createdAt",
            sortDirection: req.query.sortDirection === "asc" ? "asc" : "desc",
            pageNumber: !!req.query.pageNumber && Number(req.query.pageNumber) > 0 ? Number(req.query.pageNumber) : 1,
            pageSize: !!req.query.pageSize && Number(req.query.pageSize) > 0 ? Number(req.query.pageSize) : 10,
        }

        const searchParams: BlogSearchParams = {
            searchNameTerm: typeof req.query.searchNameTerm === "string" ? req.query.searchNameTerm : null,
        }

        const result = await blogsQueryRepo.getBlogsWithPagingAndFilter(searchParams, pagingParams)
        res.status(HttpStatusCodes.OK).json(result)
    },
    async getBlogById(req: RequestWithParams<{ id: string }>, res: Response<BlogViewModel>) {

        if (!ObjectId.isValid(req.params.id)) {
            res.sendStatus(HttpStatusCodes.NotFound)
            return
        }

        const foundBlog = await blogsQueryRepo.getBlogById(req.params.id)
        if (!foundBlog) {
            res.sendStatus(HttpStatusCodes.NotFound)
        } else {
            res.status(HttpStatusCodes.OK).json(foundBlog)
        }
    },

    async getPostsByBlogId(req: Request, res: Response<Paginator<PostViewModel>>) {

        if (!ObjectId.isValid(req.params.blogId)) {
            res.sendStatus(HttpStatusCodes.NotFound)
            return
        }

        const existingBlog = await blogsRepository.getBlogById(req.params.blogId)
        if (!existingBlog) {
            res.sendStatus(HttpStatusCodes.NotFound)
            return
        }

        const searchParams: PostSearchParams = {
            blogId: req.params.blogId,
        }

        const pagingParams: PagingParams<PostViewModel> = {
            sortBy: isKeyOf(req.query.sortBy, examplePostDocument)
                ? req.query.sortBy
                : "createdAt",
            sortDirection: req.query.sortDirection === "asc" ? "asc" : "desc",
            pageNumber: !!req.query.pageNumber && Number(req.query.pageNumber) > 0 ? Number(req.query.pageNumber) : 1,
            pageSize: !!req.query.pageSize && Number(req.query.pageSize) > 0 ? Number(req.query.pageSize) : 10,
        }

        const result = await postsQueryRepo.getPostsWithPagingAndFilter(searchParams, pagingParams)
        res.status(HttpStatusCodes.OK).json(result)
    },

    async createBlog(req: RequestWithBody<BlogInputModel>, res: Response<BlogViewModel>) {
        const createdBlogId = await blogsService.createBlog(req.body)
        const createdBlog = await blogsQueryRepo.getBlogById(createdBlogId)
        res.status(HttpStatusCodes.Created).json(createdBlog!)
    },

    async createPost(req: Request, res: Response<PostViewModel>) {
        const input: PostInputModel = {
            ...req.body,
            blogId: req.params.blogId,
        }
        try {
            const createdPostId = await postsService.createPost(input)
            const createdPost = await postsQueryRepo.getPostById(createdPostId)
            res.status(HttpStatusCodes.Created).json(createdPost!)
        } catch (e: any) {
            if (e instanceof BlogNotFoundError) {
                res.sendStatus(HttpStatusCodes.NotFound)
                return
            }
            throw e
        }
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
