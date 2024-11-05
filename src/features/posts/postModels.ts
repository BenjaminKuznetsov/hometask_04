import { BlogViewModel } from "../blog/blogModels"

export type PostDBModel = {
    title: string
    shortDescription: string
    content: string
    blogId: string
    blogName: string
    createdAt: string
}

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
    sortBy: keyof PostViewModel
    sortDirection: "asc" | "desc"
    pageNumber: number
    pageSize: number
}