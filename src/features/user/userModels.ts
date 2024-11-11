export type UserDBModel = {
    id?: string
    login: string
    email: string
    passwordHash: string
    createdAt: string
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