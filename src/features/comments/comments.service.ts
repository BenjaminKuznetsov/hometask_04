import { TCommentInput } from "./comments.model"
import { ResultType } from "../../common/result/result.type"
import { postsRepository } from "../posts/postsRepository"
import { resultHelpers } from "../../common/result/helpers"
import { commentsRepo } from "./comments.repo"

export const commentsService = {
    async createComment(postId: string, userId: string, comment: TCommentInput): Promise<ResultType<string | null>> {
        const doesPostExist = await postsRepository.doesExistById(postId)

        if (!doesPostExist) {
            return resultHelpers.notFound()
        }

        const newComment = {
            content: comment.content,
            commentatorId: userId,
            postId: postId,
            createdAt: new Date().toISOString(),
        }

        const commentId = await commentsRepo.createComment(newComment)

        return resultHelpers.success(commentId)
    },

    async editComment(commentId: string, userId: string, input: TCommentInput): Promise<ResultType<true | null>> {
        const comment = await commentsRepo.getCommentById(commentId)

        if (!comment) {
            return resultHelpers.notFound()
        }

        if (comment.commentatorId !== userId) {
            return resultHelpers.forbidden()
        }

        await commentsRepo.editComment(commentId, input)

        return resultHelpers.success(true)
    },

    async deleteComment(commentId: string, userId: string): Promise<ResultType<true | null>> {
        const comment = await commentsRepo.getCommentById(commentId)

        if (!comment) {
            return resultHelpers.notFound()
        }

        if (comment.commentatorId !== userId) {
            return resultHelpers.forbidden()
        }

        await commentsRepo.deleteComment(commentId)

        return resultHelpers.success(true)
    },
}