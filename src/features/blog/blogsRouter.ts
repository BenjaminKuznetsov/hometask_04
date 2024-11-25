import express, { Request, Response } from "express"
import { blogsService } from "./blogsService"
import { BlogInputModel, BlogSearchParams, BlogViewModel, exampleBlogDocument } from "./blogModels"
import {
    Paginator,
    PagingParams,
    RequestWithBody,
    RequestWithParams,
    RequestWithParamsAndBody,
} from "../../common/types/types"
import { basicAuthMiddleware } from "../../common/middleware/basic-auth"
import { blogValidators, handleNotFoundError } from "./blogValidators"
import { HttpStatus } from "../../common/httpStatus"
import { handleErrorsMiddleware } from "../../common/middleware/handleErrors"
import { postValidators } from "../posts/postValidators"
import { examplePostDocument, PostInputModel, PostSearchParams, PostViewModel } from "../posts/postModels"
import { BlogNotFoundError, postsService } from "../posts/postsService"
import { isKeyOf, pagingUtil } from "../../common/helpers"
import { blogsQueryRepo } from "./blogsQueryRepo"
import { postsQueryRepo } from "../posts/postsQueryRepo"
import { blogsRepository } from "./blogsRepository"
import { ObjectId } from "mongodb"

export const blogsRouter = express.Router()

const blogsController = {
    async getBlogs(req: Request, res: Response<Paginator<BlogViewModel>>) {

        // console.log(req.params)
        // console.log("req.query", req.query)

        const pagingParams = pagingUtil<BlogViewModel>(req.query, exampleBlogDocument)

        const searchParams: BlogSearchParams = {
            searchNameTerm: typeof req.query.searchNameTerm === "string" ? req.query.searchNameTerm : null,
        }

        const result = await blogsQueryRepo.getBlogsWithPagingAndFilter(searchParams, pagingParams)
        res.status(HttpStatus.OK).json(result)
    },
    async getBlogById(req: RequestWithParams<{ id: string }>, res: Response<BlogViewModel>) {

        if (!ObjectId.isValid(req.params.id)) {
            res.sendStatus(HttpStatus.NotFound)
            return
        }

        const foundBlog = await blogsQueryRepo.getBlogById(req.params.id)
        if (!foundBlog) {
            res.sendStatus(HttpStatus.NotFound)
        } else {
            res.status(HttpStatus.OK).json(foundBlog)
        }
    },

    async getPostsByBlogId(req: Request, res: Response<Paginator<PostViewModel>>) {

        if (!ObjectId.isValid(req.params.blogId)) {
            res.sendStatus(HttpStatus.NotFound)
            return
        }

        const existingBlog = await blogsRepository.getBlogById(req.params.blogId)
        if (!existingBlog) {
            res.sendStatus(HttpStatus.NotFound)
            return
        }

        const searchParams: PostSearchParams = {
            blogId: req.params.blogId,
        }

        const pagingParams = pagingUtil<PostViewModel>(req.query, examplePostDocument)

        const result = await postsQueryRepo.getPostsWithPagingAndFilter(searchParams, pagingParams)
        res.status(HttpStatus.OK).json(result)
    },

    async createBlog(req: RequestWithBody<BlogInputModel>, res: Response<BlogViewModel>) {
        const createdBlogId = await blogsService.createBlog(req.body)
        const createdBlog = await blogsQueryRepo.getBlogById(createdBlogId)
        res.status(HttpStatus.Created).json(createdBlog!)
    },

    async createPost(req: Request, res: Response<PostViewModel>) {
        const input: PostInputModel = {
            ...req.body,
            blogId: req.params.blogId,
        }
        try {
            const createdPostId = await postsService.createPost(input)
            const createdPost = await postsQueryRepo.getPostById(createdPostId)
            res.status(HttpStatus.Created).json(createdPost!)
        } catch (e: any) {
            if (e instanceof BlogNotFoundError) {
                res.sendStatus(HttpStatus.NotFound)
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
            res.sendStatus(HttpStatus.NotFound)
            return
        }
        res.sendStatus(HttpStatus.NoContent)
    },
    async deleteBlog(req: RequestWithParams<{ id: string }>, res: Response) {
        const deletedBlog = await blogsService.deleteBlog(req.params.id)
        if (!deletedBlog) {
            res.sendStatus(HttpStatus.NotFound)
            return
        }
        res.sendStatus(HttpStatus.NoContent)
    },
}

blogsRouter.get("/", blogsController.getBlogs)

blogsRouter.get("/:id", blogsController.getBlogById)

blogsRouter.get("/:blogId/posts/",
    handleNotFoundError,
    blogsController.getPostsByBlogId)

blogsRouter.post("/",
    basicAuthMiddleware,
    ...blogValidators,
    handleErrorsMiddleware,
    blogsController.createBlog,
)

blogsRouter.post("/:blogId/posts/",
    basicAuthMiddleware,
    handleNotFoundError,
    ...postValidators,
    handleErrorsMiddleware,
    blogsController.createPost,
)

blogsRouter.put("/:id",
    basicAuthMiddleware,
    ...blogValidators,
    handleErrorsMiddleware,
    blogsController.updateBlog,
)

blogsRouter.delete("/:id",
    basicAuthMiddleware,
    blogsController.deleteBlog,
)
