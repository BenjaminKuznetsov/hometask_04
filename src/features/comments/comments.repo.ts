import { Comment, CommentDocument, CommentModel, TCommentInput } from "./comments.model"
import { ObjectId } from "mongodb"

export const commentsRepo = {
    _isValidId(id: string): boolean {
        return ObjectId.isValid(id)
    },
    async createComment(input: Comment): Promise<string> {
        const createdComment = await CommentModel.create(input)
        return createdComment._id.toString()
    },

    async getCommentById(id: string): Promise<CommentDocument | null> {
        if (!this._isValidId(id)) {
            return null
        }
        const _id = new ObjectId(id)
        return CommentModel.findOne({ _id })
    },

    async editComment(commentId: string, input: TCommentInput): Promise<boolean> {
        if (!this._isValidId(commentId)) {
            return false
        }
        const _id = new ObjectId(commentId)
        const result = await CommentModel.updateOne(
            { _id },
            { $set: { content: input.content } },
        )
        return !!result.modifiedCount
    },

    async deleteComment(commentId: string): Promise<boolean> {
        if (!this._isValidId(commentId)) {
            return false
        }
        const _id = new ObjectId(commentId)
        const result = await CommentModel.deleteOne({ _id })
        return !!result.deletedCount
    },
}