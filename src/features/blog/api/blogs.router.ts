import express from "express"
import { basicAuthMiddleware } from "../../../common/middleware/basic-auth"
import { blogValidators, handleNotFoundError } from "../midleware/blogValidators"
import { handleErrorsMiddleware } from "../../../common/middleware/handleErrors"
import { postValidators } from "../../posts/midleware/postValidators"
import { ioc } from "../../../composition-root"
import { BlogsController } from "./blogs.controller"
import { notStrictBearerAuthMiddleware } from "../../../common/middleware/bearer-auth"

const blogsController = ioc.get(BlogsController)

export const blogsRouter = express.Router()

blogsRouter
    .get("/", blogsController.getBlogs.bind(blogsController))

    .get("/:id", blogsController.getBlogById.bind(blogsController))

    .get("/:blogId/posts/",
        notStrictBearerAuthMiddleware,
        handleNotFoundError,
        blogsController.getPostsByBlogId.bind(blogsController),
    )

    .post("/",
        basicAuthMiddleware,
        ...blogValidators,
        handleErrorsMiddleware,
        blogsController.createBlog.bind(blogsController),
    )

    .post("/:blogId/posts/",
        basicAuthMiddleware,
        handleNotFoundError,
        ...postValidators,
        handleErrorsMiddleware,
        blogsController.createPost.bind(blogsController),
    )

    .put("/:id",
        basicAuthMiddleware,
        ...blogValidators,
        handleErrorsMiddleware,
        blogsController.updateBlog.bind(blogsController),
    )

    .delete("/:id",
        basicAuthMiddleware,
        blogsController.deleteBlog.bind(blogsController),
    )
