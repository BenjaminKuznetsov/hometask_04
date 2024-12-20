export type AuthInput = {
    loginOrEmail: string
    password: string
}

export type TTokenPair = {
    accessToken: string
    refreshToken: string
}

export type LoginUserDTO = {
    loginOrEmail: string
    password: string
    ip?: string
    userAgent?: string
}