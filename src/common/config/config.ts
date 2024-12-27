import { config } from "dotenv"

config()

export const appConfig = {
    port: process.env.PORT || 3000,
    mongoUrl: process.env.MONGO_URL || "mongodb://0.0.0.0:27017",
    dbName: process.env.DB_NAME || "homework-dev",
    testDbName: process.env.TEST_DB_NAME || "homework-test",
    jwtSecret: process.env.JWT_SECRET || "secret",
    adminAuth: "admin:qwerty",
    mailService: "Mail.ru",
    mailRuAddress: "benjamin.study@mail.ru",
    mailRuPass: process.env.MAIL_RU_PASS || "mailRuPass",
    accessTokenExp: "1h",
    refreshTokenExp: "1d",
    cookieNames: {
        refreshToken: "refreshToken",
    },
    tooManyRequestsParams: {
        count: 5, // не более 5 запросов
        time: 10, // за 10 секунд
    },
}