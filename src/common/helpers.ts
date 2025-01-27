import { ErrorFormatter } from "express-validator"
import { FieldErrorType, PagingInput, PagingParams } from "./types/types"
import { Request } from "express"

export const encodeToBase64 = (value: string): string => Buffer.from(value, "utf8").toString("base64")

export const formatErrors: ErrorFormatter<FieldErrorType> = (error) => {
    return {
        message: error.msg,
        field: error.type === "field" ? error.path : null,
    }
}

export function isKeyOf<T extends object>(key: any, obj: T): key is keyof T {
    return key in obj
}

export function pagingUtil<T extends object>(input: PagingInput, example: T): PagingParams<T> {
    const sortBy = isKeyOf(input.sortBy, example) ? input.sortBy : "createdAt" as keyof T
    const sortDirection = input.sortDirection === "asc" ? "asc" : "desc"
    const pageNumber = !isNaN(Number(input.pageNumber)) ? Number(input.pageNumber) : 1
    const pageSize = !isNaN(Number(input.pageSize)) ? Number(input.pageSize) : 10

    return {
        sortBy,
        sortDirection,
        pageNumber,
        pageSize,
    }
}
