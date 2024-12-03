export type AuthInput = {
    loginOrEmail: string
    password: string
}

export type TTokenPair = {
    accessToken: string
    refreshToken: string
}