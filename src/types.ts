import { Request } from "express"
import { BlogViewModel } from "./features/blog/blogModels"
import { PostViewModel } from "./features/posts/postModels"

export type RequestWithBody<T> = Request<{}, {}, T>
export type RequestWithQuery<T> = Request<{}, {}, {}, T>
export type RequestWithParams<T> = Request<T>
export type RequestWithParamsAndBody<T, B> = Request<T, {}, B>

export type DB_InMemory_Type = {
    blogs: BlogViewModel[]
    posts: PostViewModel[]
}

export type DB_Collections = keyof DB_InMemory_Type

export type FieldErrorType = {
    message: string | null
    field: string | null
}

export type ApiErrorType = {
    errorsMessages: FieldErrorType[] | null
}

export type Paginator<T> = {
    pagesCount: number
    page: number
    pageSize: number
    totalCount: number
    items: T[]
}