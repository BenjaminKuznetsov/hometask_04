import { ResultType } from "../../../common/result/result.type"
import { PostsRepository } from "../../posts/infra/posts.repo"
import { resultHelpers } from "../../../common/result/helpers"
import { CommentsRepo } from "../infra/comments.repo"
import { inject, injectable } from "inversify"
import { TCommentInput } from "../api/comments.dto"
import { CommentModel } from "../domain/comments.model"
import { LikeDto } from "../../likes/domain/dto"
import { LikeStatus } from "../../likes/domain/likes.model"
import { LikesService } from "../../likes/application/likes.service"

@injectable()
export class CommentsService {
    constructor(
        @inject(CommentsRepo) private commentsRepo: CommentsRepo,
        @inject(PostsRepository) private postsRepository: PostsRepository,
        @inject(LikesService) private likesService: LikesService,
    ) {
    }

    async createComment(postId: string, userId: string, comment: TCommentInput): Promise<ResultType<string | null>> {
        const doesPostExist = await this.postsRepository.doesExistById(postId)

        if (!doesPostExist) {
            return resultHelpers.notFound()
        }

        const newComment = CommentModel.createComment({
            content: comment.content,
            commentatorId: userId,
            postId,
        })

        await this.commentsRepo.save(newComment)

        return resultHelpers.success(newComment.id)
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

    async handleLike(commentId: string, userId: string, likeStatus: LikeStatus): Promise<ResultType<true | null>> {
        const comment = await this.commentsRepo.getCommentById(commentId)

        if (!comment) {
            return resultHelpers.notFound()
        }

        const likeDto = new LikeDto(likeStatus, userId, commentId)
        const result = await this.likesService.createOrUpdateLike(likeDto)

        comment.calculateLikesCount(likeStatus, result.data.prevStatus)
        await this.commentsRepo.save(comment)

        return resultHelpers.success(true)
    }
}