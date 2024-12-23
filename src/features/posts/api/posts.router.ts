import express from "express"
import { basicAuthMiddleware } from "../../../common/middleware/basic-auth"
import { blogIdMongoValidator, postValidators } from "../midleware/postValidators"
import { handleErrorsMiddleware } from "../../../common/middleware/handleErrors"
import { bearerAuthMiddleware } from "../../../common/middleware/bearer-auth"
import { commentContentValidator } from "../../comments/midleware/comments.validators"
import { postsController } from "../../../composition-root"

export const postsRouter = express.Router()

postsRouter

    .get("/", postsController.getPosts.bind(postsController))

    .get("/:id", postsController.getPostById.bind(postsController))

    .get("/:postId/comments",
        postsController.getComments.bind(postsController),
    )

    .post("/:postId/comments",
        bearerAuthMiddleware,
        commentContentValidator,
        handleErrorsMiddleware,
        postsController.createComment.bind(postsController),
    )

    .post("/",
        basicAuthMiddleware,
        ...postValidators,
        // blogIdValidator,
        blogIdMongoValidator,
        handleErrorsMiddleware,
        postsController.createPost.bind(postsController),
    )

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
