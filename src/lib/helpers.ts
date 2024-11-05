import { ErrorFormatter } from "express-validator"
import { FieldErrorType } from "../types"

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