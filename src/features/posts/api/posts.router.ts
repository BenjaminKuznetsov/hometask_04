import express from "express"
import { basicAuthMiddleware } from "../../../common/middleware/basic-auth"
import { blogIdMongoValidator, postValidators } from "../midleware/postValidators"
import { handleErrorsMiddleware } from "../../../common/middleware/handleErrors"
import { bearerAuthMiddleware, notStrictBearerAuthMiddleware } from "../../../common/middleware/bearer-auth"
import { commentContentValidator } from "../../comments/midleware/comments.validators"
import { ioc } from "../../../composition-root"
import { PostsController } from "./posts.controller"
import { likeStatusValidator } from "../../../common/middleware/validators"

const postsController = ioc.get(PostsController)

export const postsRouter = express.Router()

postsRouter

    .get("/", notStrictBearerAuthMiddleware, postsController.getPosts.bind(postsController))

    .post("/",
        basicAuthMiddleware,
        ...postValidators,
        // blogIdValidator,
        blogIdMongoValidator,
        handleErrorsMiddleware,
        postsController.createPost.bind(postsController),
    )

    .get("/:id", notStrictBearerAuthMiddleware, postsController.getPostById.bind(postsController))

    .put("/:id",
        basicAuthMiddleware,
        ...postValidators,
        // blogIdValidator,
        blogIdMongoValidator,
        handleErrorsMiddleware,
        postsController.updatePost.bind(postsController),
    )

    .delete("/:id",
        basicAuthMiddleware,
        postsController.deletePost.bind(postsController),
    )

    .get("/:postId/comments",
        notStrictBearerAuthMiddleware,
        postsController.getComments.bind(postsController),
    )

    .post("/:postId/comments",
        bearerAuthMiddleware,
        commentContentValidator,
        handleErrorsMiddleware,
        postsController.createComment.bind(postsController),
    )

    .put("/:postId/like-status",
        bearerAuthMiddleware,
        likeStatusValidator,
        handleErrorsMiddleware,
        postsController.handleLike.bind(postsController),
    )



