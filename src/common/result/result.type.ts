import { FieldErrorType } from "../types/types"

export enum ResultStatus {
    Success = "Success",
    NotFound = "NotFound",
    Forbidden = "Forbidden",
    Unauthorized = "Unauthorized",
    BadRequest = "BadRequest",
    TooManyRequests = "TooManyRequests"
}

export type ResultType<T = null> = {
    status: ResultStatus;
    errorMessage?: string;
    extensions: FieldErrorType[];
    data: T;
};
