import { BlogsService } from "../application/blogs.service"
import { Request, Response } from "express"
import {
    ApiErrorType,
    Paginator,
    RequestWithBody,
    RequestWithParams,
    RequestWithParamsAndBody,
} from "../../../common/types/types"
import { BlogInputModel, BlogSearchParams, BlogViewModel, exampleBlogDocument } from "../domain/blog.model"
import { pagingUtil } from "../../../common/helpers"
import { BlogsQueryRepo } from "../infra/blogs.queryRepo"
import { HttpStatus } from "../../../common/httpStatus"
import { ObjectId } from "mongodb"
import { examplePostDocument, PostInputModel, PostSearchParams, PostViewModel } from "../../posts/domain/post.model"
import { PostsQueryRepo } from "../../posts/infra/posts.queryRepo"
import { PostsService } from "../../posts/application/posts.service"
import { resultHelpers } from "../../../common/result/helpers"
import { inject } from "inversify"

export class BlogsController {
    constructor(
        @inject(BlogsService) private blogsService: BlogsService,
        @inject(BlogsQueryRepo) private blogsQueryRepo: BlogsQueryRepo,
        @inject(PostsQueryRepo) private postsQueryRepo: PostsQueryRepo,
        @inject(PostsService) private postsService: PostsService,
    ) {
    }

    async getBlogs(req: Request, res: Response<Paginator<BlogViewModel>>) {

        const pagingParams = pagingUtil<BlogViewModel>(req.query, exampleBlogDocument)

        const searchParams: BlogSearchParams = {
            searchNameTerm: typeof req.query.searchNameTerm === "string" ? req.query.searchNameTerm : null,
        }

        const result = await this.blogsQueryRepo.getBlogsWithPagingAndFilter(searchParams, pagingParams)
        res.status(HttpStatus.OK).json(result)
    }

    async getBlogById(req: RequestWithParams<{ id: string }>, res: Response<BlogViewModel>) {

        if (!ObjectId.isValid(req.params.id)) {
            res.sendStatus(HttpStatus.NotFound)
            return
        }

        const foundBlog = await this.blogsQueryRepo.getBlogById(req.params.id)
        if (!foundBlog) {
            res.sendStatus(HttpStatus.NotFound)
        } else {
            res.status(HttpStatus.OK).json(foundBlog)
        }
    }

    async getPostsByBlogId(req: Request, res: Response<Paginator<PostViewModel>>) {

        if (!ObjectId.isValid(req.params.blogId)) {
            res.sendStatus(HttpStatus.NotFound)
            return
        }

        const existingBlog = await this.blogsService.getBlogById(req.params.blogId)
        if (!existingBlog) {
            res.sendStatus(HttpStatus.NotFound)
            return
        }

        const searchParams: PostSearchParams = {
            blogId: req.params.blogId,
        }

        const pagingParams = pagingUtil<PostViewModel>(req.query, examplePostDocument)

        const result = await this.postsQueryRepo.getPostsWithPagingAndFilter(searchParams, pagingParams, req.userCtx.userId)
        res.status(HttpStatus.OK).json(result)
    }

    async createBlog(req: RequestWithBody<BlogInputModel>, res: Response<BlogViewModel>) {
        const createdBlogId = await this.blogsService.createBlog(req.body)
        const createdBlog = await this.blogsQueryRepo.getBlogById(createdBlogId)
        res.status(HttpStatus.Created).json(createdBlog!)
    }

    async createPost(req: Request, res: Response<PostViewModel | ApiErrorType>) {
        const input: PostInputModel = {
            ...req.body,
            blogId: req.params.blogId,
        }
        const result = await this.postsService.createPost(input)

        if (!resultHelpers.isSuccess(result)) {
            res.status(resultHelpers.resultCodeToHttpException(result.status)).json({ errorsMessages: result.extensions })
            return
        }
        const createdPost = await this.postsQueryRepo.getPostById(result.data, req.userCtx.userId)
        res.status(HttpStatus.Created).json(createdPost!)

    }

    async updateBlog(
        req: RequestWithParamsAndBody<{ id: string }, BlogInputModel>,
        res: Response<BlogViewModel>,
    ) {
        const updatedBlog = await this.blogsService.updateBlog(req.params.id, req.body)
        if (!updatedBlog) {
            res.sendStatus(HttpStatus.NotFound)
            return
        }
        res.sendStatus(HttpStatus.NoContent)
    }

    async deleteBlog(req: RequestWithParams<{ id: string }>, res: Response) {
        const deletedBlog = await this.blogsService.deleteBlog(req.params.id)
        if (!deletedBlog) {
            res.sendStatus(HttpStatus.NotFound)
            return
        }
        res.sendStatus(HttpStatus.NoContent)
    }
}