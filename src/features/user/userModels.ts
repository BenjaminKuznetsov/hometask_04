export type UserDBModel = {
    id?: string
    login: string
    email: string
    passwordHash: string
    createdAt: string
    emailConfirmation: TEmailConfirmation
}

export type TEmailConfirmation = {
    confirmationCode?: string // not required if created by admin
    expirationDate?: Date // not required if created by admin
    confirmationStatus: ConfirmationStatus
}

export enum ConfirmationStatus {
    CREATED_BY_ADMIN = 0,
    NOT_CONFIRMED = 1,
    CONFIRMED = 2,
}

export type TUserWithId = UserDBModel & {
    id: string
}

export type UserDBFilter = {
    login?: string
    email?: string
}

export type UserViewModel = {
    id: string
    login: string
    email: string
    createdAt: string
}

export type MeViewModel = {
    userId: string
    login: string
    email: string
}

export const exampleUserDocument = {
    id: "1",
    login: "string",
    email: "string",
    createdAt: "string",
}

export type UserSearchParams = {
    searchLoginTerm?: string | null
    searchEmailTerm?: string | null
}

export type UserInputModel = {
    login: string
    email: string
    password: string
}