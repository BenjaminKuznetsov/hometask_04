import { config } from "dotenv"

config()

export const appConfig = {
    port: process.env.PORT || 3000,
    mongoUrl: process.env.MONGO_URL || "mongodb://0.0.0.0:27017",
    dbName: process.env.DB_NAME || "test",
    jwtSecret: process.env.JWT_SECRET || "secret",
    adminAuth: "admin:qwerty",
    mailService: "Mail.ru",
    mailRuAddress: "benjamin.study@mail.ru",
    mailRuPass: process.env.MAIL_RU_PASS || "mailRuPass",
    accessTokenExp: "10s",
    refreshTokenExp: "20s",
    cookieNames: {
        refreshToken: "refreshToken",
    },
}