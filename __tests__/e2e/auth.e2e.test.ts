import request from "supertest"
import { app } from "../../src/app"
import { paths } from "../../src/common/paths"
import { HttpStatus } from "../../src/common/httpStatus"
import { db } from "../../src/db/mongo"
import { CreatedUser, e2eSeeder } from "../helpers/seeders"

describe("auth", () => {

    beforeAll(async () => {
        await db.run()
        await db.drop()
    })

    afterAll(async () => {
        await db.stop()
    })

    // beforeEach(async () => {
    //     await db.drop()
    // })

    describe("first user", () => {
        let user: CreatedUser

        beforeAll(async () => {
            const users = await e2eSeeder.users(1)
            user = users[0]
        })

        it("user should be created", () => {
            expect(user).toEqual({
                id: expect.any(String),
                email: user.email,
                login: user.login,
                createdAt: expect.any(String),
                password: user.password,
            })
        })

        it("failed login with wrong login or email", async () => {
            await request(app)
                .post(paths.auth.login)
                .send({ loginOrEmail: "123123", password: user.password })
                .expect(HttpStatus.Unauthorized)
        })

        it("failed login with wrong password", async () => {
            await request(app)
                .post(paths.auth.login)
                .send({ loginOrEmail: user.login, password: "123123" })
                .expect(HttpStatus.Unauthorized)
        })

        it("failed login without login or email", async () => {
            await request(app)
                .post(paths.auth.login)
                .send({ password: user.password })
                .expect(HttpStatus.BadRequest)
        })

        it("failed login without password", async () => {
            await request(app)
                .post(paths.auth.login)
                .send({ loginOrEmail: user.login })
                .expect(HttpStatus.BadRequest)
        })

        it("login user", async () => {
            const res1 = await request(app)
                .post(paths.auth.login)
                .send({ loginOrEmail: user.login, password: user.password })
                .expect(HttpStatus.OK)

            expect(res1.body).toEqual({
                accessToken: expect.any(String),
            })

            user.accessToken = res1.body.accessToken
        })

        it("auth and get me", async () => {
            const res2 = await request(app)
                .get(paths.auth.me)
                .set("Authorization", `Bearer ${user.accessToken}`)
                .expect(HttpStatus.OK)

            expect(res2.body).toEqual({
                userId: user.id,
                email: user.email,
                login: user.login,
            })
        })

        it("failed auth with invalid token", async () => {
            await request(app)
                .get(paths.auth.me)
                .set("Authorization", `Bearer ${user.accessToken}123`)
                .expect(HttpStatus.Unauthorized)
        })
    })

})
