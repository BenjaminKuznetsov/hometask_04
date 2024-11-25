import { commentsCollection } from "../../db/mongo"
import { TCommentDB, TCommentDBWithId, TCommentInput } from "./comments.types"
import { ObjectId, WithId } from "mongodb"

export const commentsRepo = {
    _isValidId(id: string): boolean {
        return ObjectId.isValid(id)
    },
    _removeObjectId(comment: WithId<TCommentDB>): TCommentDBWithId {
        return {
            id: comment._id.toString(),
            commentatorId: comment.commentatorId,
            content: comment.content,
            postId: comment.postId,
            createdAt: comment.createdAt,
        }
    },
    async createComment(input: TCommentDB): Promise<string> {
        const res = await commentsCollection.insertOne(input)
        return res.insertedId.toString()
    },

    async getCommentById(id: string): Promise<TCommentDB | null> {
        if (!this._isValidId(id)) {
            return null
        }
        const _id = new ObjectId(id)
        const foundComment = await commentsCollection.findOne({ _id })
        return foundComment ? this._removeObjectId(foundComment) : null
    },

    async editComment(commentId: string, input: TCommentInput): Promise<boolean> {
        if (!this._isValidId(commentId)) {
            return false
        }
        const _id = new ObjectId(commentId)
        const result = await commentsCollection.updateOne(
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
        const result = await commentsCollection.deleteOne({ _id })
        return !!result.deletedCount
    },
}