import { TCommentInput } from "../domain/comments.model"
import { ResultType } from "../../../common/result/result.type"
import { PostsRepository } from "../../posts/infra/posts.repo"
import { resultHelpers } from "../../../common/result/helpers"
import { CommentsRepo } from "../infra/comments.repo"

export class CommentsService {
    constructor(
        private commentsRepo: CommentsRepo,
        private postsRepository: PostsRepository,
    ) {
    }

    async createComment(postId: string, userId: string, comment: TCommentInput): Promise<ResultType<string | null>> {
        const doesPostExist = await this.postsRepository.doesExistById(postId)

        if (!doesPostExist) {
            return resultHelpers.notFound()
        }

        const newComment = {
            content: comment.content,
            commentatorId: userId,
            postId: postId,
            createdAt: new Date().toISOString(),
        }

        const commentId = await this.commentsRepo.createComment(newComment)

        return resultHelpers.success(commentId)
    }

    async editComment(commentId: string, userId: string, input: TCommentInput): Promise<ResultType<true | null>> {
        const comment = await this.commentsRepo.getCommentById(commentId)

        if (!comment) {
            return resultHelpers.notFound()
        }

        if (comment.commentatorId !== userId) {
            return resultHelpers.forbidden()
        }

        await this.commentsRepo.editComment(commentId, input)

        return resultHelpers.success(true)
    }

    async deleteComment(commentId: string, userId: string): Promise<ResultType<true | null>> {
        const comment = await this.commentsRepo.getCommentById(commentId)

        if (!comment) {
            return resultHelpers.notFound()
        }

        if (comment.commentatorId !== userId) {
            return resultHelpers.forbidden()
        }

        await this.commentsRepo.deleteComment(commentId)

        return resultHelpers.success(true)
    }
}