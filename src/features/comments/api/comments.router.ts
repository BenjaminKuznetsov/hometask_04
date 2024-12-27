import { Router } from "express"
import { bearerAuthMiddleware } from "../../../common/middleware/bearer-auth"
import { commentContentValidator } from "../midleware/comments.validators"
import { handleErrorsMiddleware } from "../../../common/middleware/handleErrors"
import { ioc } from "../../../composition-root"
import { CommentsController } from "./comments.controller"
import { likeStatusValidator } from "../../../common/middleware/validators"

const commentsController = ioc.get(CommentsController)

export const commentsRouter = Router()

commentsRouter

    .get("/:id", commentsController.getById.bind(commentsController))

    .put("/:id",
        bearerAuthMiddleware,
        commentContentValidator,
        handleErrorsMiddleware,
        commentsController.updateById.bind(commentsController),
    )

    .put("/:commentId/like-status",
        bearerAuthMiddleware,
        likeStatusValidator,
        handleErrorsMiddleware,
        commentsController.handleLike.bind(commentsController))

    .delete("/:id",
        bearerAuthMiddleware,
        commentsController.deleteById.bind(commentsController),
    )