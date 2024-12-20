import { CommentDocument, CommentModel, TCommentViewModel } from "../domain/comments.model"
import { ObjectId } from "mongodb"
import { usersRepo } from "../../user/infra/usersRepo"
import { Paginator, PagingParams } from "../../../common/types/types"

export const commentsQueryRepo = {
    _isValidId: (id: string): boolean => {
        return ObjectId.isValid(id)
    },

    async getCommentsByPostWithPaging(postId: string, pagingParams: PagingParams<TCommentViewModel>): Promise<Paginator<TCommentViewModel>> {
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
            const user = await usersRepo.getUserById(comment.commentatorId)

            mappedComments.push({
                id: comment._id.toString(),
                content: comment.content,
                commentatorInfo: {
                    userId: user!.id,
                    userLogin: user!.login,
                },
                createdAt: comment.createdAt.toISOString(),
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
    },

    async getCommentById(id: string): Promise<TCommentViewModel | null> {
        if (!this._isValidId(id)) {
            return null
        }
        const _id = new ObjectId(id)
        const foundComment: CommentDocument | null = await CommentModel.findOne({ _id })

        if (!foundComment) {
            return null
        }

        const user = await usersRepo.getUserById(foundComment.commentatorId)

        return {
            id: foundComment._id.toString(),
            content: foundComment.content,
            commentatorInfo: {
                userId: user!.id,
                userLogin: user!.login,
            },
            createdAt: foundComment.createdAt.toISOString(),
        }
    },
}