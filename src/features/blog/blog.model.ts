import { HydratedDocument, model, Schema } from "mongoose"
import { Timestamps } from "../../common/types/types"

export type Blog = {
    name: string
    description: string
    websiteUrl: string
    // createdAt: string
    isMembership: boolean
}

export type BlogDocument = HydratedDocument<Blog> & Timestamps

export const BlogSchema = new Schema<Blog>({
    name: { type: String, require: true },
    description: { type: String, require: true },
    websiteUrl: { type: String, require: true },
    isMembership: { type: Boolean, require: true },
}, {
    timestamps: true,
})

export const BlogModel = model<Blog>("blogs", BlogSchema)

export type BlogViewModel = {
    id: string
    name: string
    description: string
    websiteUrl: string
    createdAt: string
    isMembership: boolean
}

export const exampleBlogDocument = {
    id: "1",
    name: "string",
    description: "string",
    websiteUrl: "string",
    createdAt: "string",
    isMembership: false,
}

export type BlogSearchParams = {
    searchNameTerm?: string | null
}

export type BlogInputModel = {
    name: string
    description: string
    websiteUrl: string
}

