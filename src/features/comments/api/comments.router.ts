import { Router } from "express"
import { bearerAuthMiddleware } from "../../../common/middleware/bearer-auth"
import { commentContentValidator } from "../midleware/comments.validators"
import { handleErrorsMiddleware } from "../../../common/middleware/handleErrors"
import { commentsController } from "../../../composition-root"

export const commentsRouter = Router()

commentsRouter

    .get("/:id", commentsController.getById.bind(commentsController))

    .put("/:id",
        bearerAuthMiddleware,
        commentContentValidator,
        handleErrorsMiddleware,
        commentsController.updateById.bind(commentsController),
    )

    .delete("/:id",
        bearerAuthMiddleware,
        commentsController.deleteById.bind(commentsController),
    )