import { CommentDocument, CommentModel } from "../domain/comments.model"
import { ObjectId } from "mongodb"
import { usersRepo } from "../../user/infra/usersRepo"
import { Paginator, PagingParams } from "../../../common/types/types"
import { inject, injectable } from "inversify"
import { LikesInfo, TCommentViewModel } from "../api/comments.dto"
import { LikeStatus } from "../../likes/domain/likes.model"
import { LikesRepo } from "../../likes/infra/likes.repo"

@injectable()
export class CommentsQueryRepo {
    constructor(
        @inject(LikesRepo) private likesRepo: LikesRepo,
    ) { }

    async getCommentsByPostWithPaging(postId: string, pagingParams: PagingParams<TCommentViewModel>, userId: string | null): Promise<Paginator<TCommentViewModel>> {
        if (!this._isValidId(postId)) {
            return {
                pagesCount: 0,
                page: 0,
                pageSize: 0,
                totalCount: 0,
                items: [],
            }
        }

        const comments: CommentDocument[] = await CommentModel
            .find({ postId: postId }, null, {
                sort: { [pagingParams.sortBy]: pagingParams.sortDirection },
                skip: (pagingParams.pageNumber - 1) * pagingParams.pageSize,
                limit: pagingParams.pageSize,
            })

        const mappedComments: TCommentViewModel[] = []

        for (const comment of comments) {
            const commentator = await usersRepo.getUserById(comment.commentatorId)
            const likesInfo = await this._getLikesInfo(comment.id, userId)

            mappedComments.push({
                id: comment._id.toString(),
                content: comment.content,
                commentatorInfo: {
                    userId: commentator!.id,
                    userLogin: commentator!.login,
                },
                createdAt: comment.createdAt.toISOString(),
                likesInfo,
            })
        }

        const totalCount = await CommentModel.countDocuments({ postId })

        return {
            pagesCount: Math.ceil((totalCount / pagingParams.pageSize) || 1),
            page: pagingParams.pageNumber,
            pageSize: pagingParams.pageSize,
            totalCount,
            items: mappedComments,
        }
    }

    async getCommentById(commentId: string, userId: string | null): Promise<TCommentViewModel | null> {
        if (!this._isValidId(commentId)) {
            return null
        }
        const _id = new ObjectId(commentId)
        const foundComment: CommentDocument | null = await CommentModel.findOne({ _id })

        if (!foundComment) {
            return null
        }

        const commentator = await usersRepo.getUserById(foundComment.commentatorId)

        const likesInfo = await this._getLikesInfo(commentId, userId)

        return {
            id: foundComment._id.toString(),
            content: foundComment.content,
            commentatorInfo: {
                userId: commentator!.id,
                userLogin: commentator!.login,
            },
            createdAt: foundComment.createdAt.toISOString(),
            likesInfo,
        }
    }

    private async _getLikesInfo(commentId: string, userId: string | null): Promise<LikesInfo> {
        const likesCount = await this.likesRepo.getCountByParentId(commentId, LikeStatus.Like) // Это избыточно, потому что эта инфа уже есть в комменте
        const dislikesCount = await this.likesRepo.getCountByParentId(commentId, LikeStatus.Dislike)  // Это избыточно, потому что эта инфа уже есть в комменте
        let userStatus: LikeStatus

        if (!userId) {
            userStatus = LikeStatus.None
        } else {
            const like = await this.likesRepo.getLikeByMetadata(commentId, userId)
            if (!like) {
                userStatus = LikeStatus.None
            } else {
                userStatus = like.status
            }
        }

        return { likesCount, dislikesCount, myStatus: userStatus }
    }

    private _isValidId(id: string): boolean {
        return ObjectId.isValid(id)
    }
}