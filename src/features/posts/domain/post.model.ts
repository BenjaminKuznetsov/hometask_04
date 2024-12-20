import { HydratedDocument, model, Schema } from "mongoose"
import { Timestamps } from "../../../common/types/types"

export type Post = {
    title: string
    shortDescription: string
    content: string
    blogId: string
    blogName: string
    // createdAt: string
}

export type PostDocument = HydratedDocument<Post> & Timestamps

export const PostSchema = new Schema<Post>({
    title: { type: String, require: true },
    shortDescription: { type: String, require: true },
    content: { type: String, require: true },
    blogId: { type: String, require: true },
    blogName: { type: String, require: true },
}, {
    timestamps: true,
})

export const PostModel = model<Post>("posts", PostSchema)

export type PostViewModel = {
    id: string
    title: string
    shortDescription: string
    content: string
    blogId: string
    blogName: string
    createdAt: string
}

export type PostInputModel = {
    title: string
    shortDescription: string
    content: string
    blogId: string
}

export const examplePostDocument = {
    id: "1",
    title: "string",
    shortDescription: "string",
    content: "string",
    blogId: "string",
    blogName: "string",
    createdAt: "string",
}

export type PostSearchParams = {
    blogId?: string
}