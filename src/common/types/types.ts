import { Request } from "express"

export type RequestWithBody<T> = Request<{}, {}, T>
export type RequestWithQuery<T> = Request<{}, {}, {}, T>
export type RequestWithParams<T> = Request<T>
export type RequestWithParamsAndBody<T, B> = Request<T, {}, B>

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

export type PagingParams<T> = {
    sortBy: keyof T
    sortDirection: "asc" | "desc"
    pageNumber: number
    pageSize: number
}

export type PagingInput = {
    sortBy?: unknown
    sortDirection?: unknown
    pageNumber?: unknown
    pageSize?: unknown
}
