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

    badRequest(extension: FieldErrorType): ResultType {
        return {
            status: ResultStatus.BadRequest,
            extensions: [ extension ],
            data: null,
        }
    },

    notFound(extension?: FieldErrorType): ResultType {
        return {
            status: ResultStatus.NotFound,
            extensions: extension ? [ extension ] : [],
            data: null,
        }
    },

    unauthorized(extension?: FieldErrorType): ResultType {
        return {
            status: ResultStatus.Unauthorized,
            extensions: extension ? [ extension ] : [],
            data: null,
        }
    },

    forbidden(extension?: FieldErrorType): ResultType {
        return {
            status: ResultStatus.Forbidden,
            extensions: extension ? [ extension ] : [],
            data: null,
        }
    },

    tooManyRequests(): ResultType {
        return {
            status: ResultStatus.TooManyRequests,
            extensions: [],
            data: null,
        }
    },

    isSuccess<T>(result: ResultType<T | null>): result is ResultType<T> {
        return result.status === ResultStatus.Success
    },

    isNotSuccess<T>(result: ResultType<T | null>): result is ResultType {
        return !result.data && result.status !== ResultStatus.Success

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
            case ResultStatus.TooManyRequests:
                return HttpStatus.TooManyRequests
            default:
                return HttpStatus.InternalServerError
        }
    },
}