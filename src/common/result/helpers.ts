import { ResultStatus, ResultType } from "./result.type"
import { FieldErrorType } from "../types/types"
import { HttpStatus } from "../httpStatus"

export const resultHelpers = {
    success<T>(data: T, extensions?: FieldErrorType[]): ResultType<T> {
        return {
            status: ResultStatus.Success,
            extensions: extensions || [],
            data,
        }
    },

    badRequest(data: FieldErrorType): ResultType {
        return {
            status: ResultStatus.BadRequest,
            extensions: [ data ],
            data: null,
        }
    },

    notFound(data?: FieldErrorType): ResultType {
        return {
            status: ResultStatus.NotFound,
            extensions: data ? [ data ] : [],
            data: null,
        }
    },

    unauthorized(data?: FieldErrorType): ResultType {
        return {
            status: ResultStatus.Unauthorized,
            extensions: data ? [ data ] : [],
            data: null,
        }
    },

    forbidden(data?: FieldErrorType): ResultType {
        return {
            status: ResultStatus.Forbidden,
            extensions: data ? [ data ] : [],
            data: null,
        }
    },

    isSuccess<T>(result: ResultType<T | null>): result is ResultType<T> {
        return result.status === ResultStatus.Success
    },

    resultCodeToHttpException(resultCode: ResultStatus): HttpStatus {
        switch (resultCode) {
            case ResultStatus.BadRequest:
                return HttpStatus.BadRequest
            case ResultStatus.Forbidden:
                return HttpStatus.Forbidden
            case ResultStatus.NotFound:
                return HttpStatus.NotFound
            case ResultStatus.Unauthorized:
                return HttpStatus.Unauthorized
            default:
                return HttpStatus.InternalServerError
        }
    },
}