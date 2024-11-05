import express, { Request, Response } from "express"
import { blogsService } from "./blogsService"
import { BlogInputModel, BlogViewModel, BlogSearchParams, exampleBlogDocument } from "./blogModels"
import { ApiErrorType, RequestWithBody, RequestWithParams, RequestWithParamsAndBody } from "../../types"
import { authMiddleware } from "../../middleware/auth"
import { blogValidators } from "./blogValidators"
import { HttpStatusCodes } from "../../lib/httpStatusCodes"
import { handleErrorsMiddleware } from "../../middleware/handleErrors"

export const blogsRouter = express.Router()

function isKeyOf<T extends object>(key: any, obj: T): key is keyof T {
    return key in obj
}

const videoController = {
    async getVideos(req: Request, res: Response<BlogViewModel[]>) {

        const queryParams: BlogSearchParams = {
            searchNameTerm: req.params.searchNameTerm || null,
            sortBy: isKeyOf(req.params.sortBy, exampleBlogDocument)
                ? req.params.sortBy
                : "createdAt",
            sortDirection: req.params.sortDirection === "desc" ? "desc" : "asc",
            pageNumber: Number(req.params.pageNumber) || 1,
            pageSize: Number(req.params.pageSize) || 10,
        }

        const foundBlogs: BlogViewModel[] = await blogsService.getAllBlogs(queryParams)
        res.status(HttpStatusCodes.OK).json(foundBlogs)
    },
    async getVideoById(req: RequestWithParams<{ id: string }>, res: Response<BlogViewModel>) {
        const foundBlog = await blogsService.getBlogById(req.params.id)
        if (!foundBlog) {
            res.sendStatus(HttpStatusCodes.NotFound)
        } else {
            res.status(HttpStatusCodes.OK).json(foundBlog)
        }
    },
    async createVideo(req: RequestWithBody<BlogInputModel>, res: Response<BlogViewModel | ApiErrorType>) {
        const createdBlog = await blogsService.createBlog(req.body)
        res.status(HttpStatusCodes.Created).json(createdBlog)
    },
    async updateVideo(
        req: RequestWithParamsAndBody<{ id: string }, BlogInputModel>,
        res: Response<BlogViewModel | ApiErrorType>,
    ) {
        const updatedBlog = await blogsService.updateBlog(req.params.id, req.body)
        if (!updatedBlog) {
            res.sendStatus(HttpStatusCodes.NotFound)
            return
        }
        res.sendStatus(HttpStatusCodes.NoContent)
    },
    async deleteVideo(req: RequestWithParams<{ id: string }>, res: Response) {
        const deletedBlog = await blogsService.deleteBlog(req.params.id)
        if (!deletedBlog) {
            res.sendStatus(HttpStatusCodes.NotFound)
            return
        }
        res.sendStatus(HttpStatusCodes.NoContent)
    },
}

blogsRouter.get("/", videoController.getVideos)

blogsRouter.get("/:id", videoController.getVideoById)

blogsRouter.post("/",
    authMiddleware,
    ...blogValidators,
    handleErrorsMiddleware,
    videoController.createVideo,
)

blogsRouter.put("/:id",
    authMiddleware,
    ...blogValidators,
    handleErrorsMiddleware,
    videoController.updateVideo,
)

blogsRouter.delete("/:id",
    authMiddleware,
    videoController.deleteVideo,
)
