import { HydratedDocument, model, Schema } from "mongoose"
import { Timestamps } from "../../../common/types/types"

export type Comment = {
    content: string
    commentatorId: string
    postId: string
    // createdAt: string
}

export type CommentDocument = HydratedDocument<Comment> & Timestamps

export const CommentSchema = new Schema<Comment>({
    content: { type: String, require: true },
    commentatorId: { type: String, require: true },
    postId: { type: String, require: true },
}, {
    timestamps: true,
})

export const CommentModel = model<Comment>("comments", CommentSchema)

export type TCommentInput = {
    content: string
}

export type TCommentViewModel = {
    id: string
    content: string
    commentatorInfo: {
        userId: string
        userLogin: string
    }
    createdAt: string
}

export const exampleCommentDocument = {
    id: "1",
    content: "string",
    commentatorInfo: {
        userId: "string",
        userLogin: "string",
    },
    createdAt: "string",
}