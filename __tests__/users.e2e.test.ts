import request from "supertest"
import { app } from "../src/app"
import { PATHS } from "../src/lib/paths"
import { HttpStatusCodes } from "../src/lib/httpStatusCodes"
import { users } from "../src/mock"
import { encodeToBase64 } from "../src/lib/helpers"
import { runDb, usersCollection } from "../src/db/mongo"
import { UserInputModel } from "../src/features/user/userModels"

const ADMIN_AUTH = "admin:qwerty"

describe("users", () => {
    let connectedToDb: boolean

    beforeAll(async () => {
        connectedToDb = await runDb()
    })

    beforeEach(async () => {
        await usersCollection.deleteMany()
        console.log("usersCollection.deleteMany()")
    })

    it("should successfully set & get information from the database", async () => {
        expect(connectedToDb).toBe(true)
    })

    it("shouldn't accept unauthenticated requests", async () => {

        await request(app).post(PATHS.USERS).send(users[0]).expect(HttpStatusCodes.Unauthorized)

        await request(app)
            .post(PATHS.USERS)
            .set("Authorization", `Basic qwerty:qwerty`)
            .send(users[0])
            .expect(HttpStatusCodes.Unauthorized)
    })

    it("shouldn't create user with incorrect input data", async () => {

        const data1: UserInputModel = {
            email: "user1_user1.com",
            login: "us@sfsf+",
            password: "user1dhgfhdhgfhfgdhgfdhfgd",
        }

        const data2 = {
            email: "user1@user1.com",
            login: "user1",
        }

        const res1 = await request(app)
            .post(PATHS.USERS)
            .set("Authorization", `Basic ${encodeToBase64(ADMIN_AUTH)}`)
            .send(data1)
            .expect(HttpStatusCodes.BadRequest)

        const res2 = await request(app)
            .post(PATHS.USERS)
            .set("Authorization", `Basic ${encodeToBase64(ADMIN_AUTH)}`)
            .send(data2)
            .expect(HttpStatusCodes.BadRequest)

        expect(res1.body).toEqual({
            errorsMessages: expect.arrayContaining([
                { field: "login", message: expect.any(String) },
                { field: "password", message: expect.any(String) },
                { field: "email", message: expect.any(String) },
            ]),
        })

        expect(res2.body).toEqual({
            errorsMessages: expect.arrayContaining([
                { field: "password", message: expect.any(String) },
            ]),
        })
    })

    it("should create user and shouldn`t create user with not unique login or email", async () => {
        const data: UserInputModel = {
            email: "user1@user1.com",
            login: "user1",
            password: "user1user1",
        }

        const res = await request(app)
            .post(PATHS.USERS)
            .set("Authorization", `Basic ${encodeToBase64(ADMIN_AUTH)}`)
            .send(data)
            .expect(HttpStatusCodes.Created)

        expect(res.body).toEqual({
            id: expect.any(String),
            email: data.email,
            login: data.login,
            createdAt: expect.any(String),
        })

        const data1: UserInputModel = {
            email: "user111@user1.com",
            login: "user1",
            password: "user1user1",
        }

        const data2: UserInputModel = {
            email: "user1@user1.com",
            login: "user111",
            password: "user1user1",
        }

        const res1 = await request(app)
            .post(PATHS.USERS)
            .set("Authorization", `Basic ${encodeToBase64(ADMIN_AUTH)}`)
            .send(data1)
            .expect(HttpStatusCodes.BadRequest)

        expect(res1.body).toEqual({
            errorsMessages: [ {
                field: "login",
                message: expect.any(String),
            } ],
        })

        const res2 = await request(app)
            .post(PATHS.USERS)
            .set("Authorization", `Basic ${encodeToBase64(ADMIN_AUTH)}`)
            .send(data2)
            .expect(HttpStatusCodes.BadRequest)

        expect(res2.body).toEqual({
            errorsMessages: [ {
                field: "email",
                message: expect.any(String),
            } ],
        })
    })

    it("should return users with paging and sorting", async () => {

        for (const user of users) {
            const res = await request(app)
                .post(PATHS.USERS)
                .set("Authorization", `Basic ${encodeToBase64(ADMIN_AUTH)}`)
                .send(user)
                .expect(HttpStatusCodes.Created)
            // console.log("res", res.body)
        }

        const response = await request(app)
            .get(PATHS.USERS)
            .set("Authorization", `Basic ${encodeToBase64(ADMIN_AUTH)}`)
            .expect(HttpStatusCodes.OK)

        expect(response.body).toEqual({
            pagesCount: 1,
            page: 1,
            pageSize: 10,
            totalCount: 5,
            items: [
                {
                    id: expect.any(String),
                    login: "AlexWiams",
                    email: "alex@alex.com",
                    createdAt: expect.any(String),
                },
                {
                    id: expect.any(String),
                    login: "BobBrown",
                    email: "bob@bob.com",
                    createdAt: expect.any(String),
                },
                {
                    id: expect.any(String),
                    login: "AnnJohnson",
                    email: "ann@ann.com",
                    createdAt: expect.any(String),
                },
                {
                    id: expect.any(String),
                    login: "DaveSmith",
                    email: "dave@dave.com",
                    createdAt: expect.any(String),
                },
                {
                    id: expect.any(String),
                    login: "JohnDoe",
                    email: "johnan@john.com",
                    createdAt: expect.any(String),
                },
            ],
        })

        const response2 = await request(app)
            .get(PATHS.USERS + "?searchLoginTerm=s&sortBy=login")
            .set("Authorization", `Basic ${encodeToBase64(ADMIN_AUTH)}`)
            .expect(HttpStatusCodes.OK)

        expect(response2.body).toEqual({
            pagesCount: 1,
            page: 1,
            pageSize: 10,
            totalCount: 3,
            items: [
                {
                    id: expect.any(String),
                    login: "DaveSmith",
                    email: "dave@dave.com",
                    createdAt: expect.any(String),
                },
                {
                    id: expect.any(String),
                    login: "AnnJohnson",
                    email: "ann@ann.com",
                    createdAt: expect.any(String),
                },
                {
                    id: expect.any(String),
                    login: "AlexWiams",
                    email: "alex@alex.com",
                    createdAt: expect.any(String),
                },
            ],
        })

        const response3 = await request(app)
            .get(PATHS.USERS + "?searchEmailTerm=an&sortBy=loginsortDirection=asc")
            .set("Authorization", `Basic ${encodeToBase64(ADMIN_AUTH)}`)
            .expect(HttpStatusCodes.OK)

        expect(response3.body).toEqual({
            pagesCount: 1,
            page: 1,
            pageSize: 10,
            totalCount: 2,
            items: [
                {
                    id: expect.any(String),
                    login: "AnnJohnson",
                    email: "ann@ann.com",
                    createdAt: expect.any(String),
                },
                {
                    id: expect.any(String),
                    login: "JohnDoe",
                    email: "johnan@john.com",
                    createdAt: expect.any(String),
                },
            ],
        })
    })

    it("should delete  user with correct id and shouldn't delete user with non-existent id", async () => {
        const ids = []

        for (const user of users) {
            const res = await request(app)
                .post(PATHS.USERS)
                .set("Authorization", `Basic ${encodeToBase64(ADMIN_AUTH)}`)
                .send(user)
                .expect(HttpStatusCodes.Created)

            ids.push(res.body.id)
        }

        const response = await request(app)
            .delete(PATHS.USERS + "/" + ids[0])
            .set("Authorization", `Basic ${encodeToBase64(ADMIN_AUTH)}`)
            .expect(HttpStatusCodes.NoContent)

        const response1 = await request(app)
            .get(PATHS.USERS)
            .set("Authorization", `Basic ${encodeToBase64(ADMIN_AUTH)}`)
            .expect(HttpStatusCodes.OK)

        expect(response1.body.totalCount).toBe(4)

        const response2 = await request(app)
            .delete(PATHS.USERS + "/111")
            .set("Authorization", `Basic ${encodeToBase64(ADMIN_AUTH)}`)
            .expect(HttpStatusCodes.NotFound)
    })

    it("should login user with correct credentials and shouldn't login user with incorrect credentials", async () => {

        await request(app)
            .post(PATHS.USERS)
            .set("Authorization", `Basic ${encodeToBase64(ADMIN_AUTH)}`)
            .send(users[0])
            .expect(HttpStatusCodes.Created)

        await request(app)
            .post(PATHS.AUTH + "/login")
            .send({ loginOrEmail: users[0].login, password: users[0].password })
            .expect(HttpStatusCodes.NoContent)

        await request(app)
            .post(PATHS.AUTH + "/login")
            .send({ loginOrEmail: users[0].email, password: users[0].password })
            .expect(HttpStatusCodes.NoContent)

        await request(app)
            .post(PATHS.AUTH + "/login")
            .send({ loginOrEmail: users[0].email, password: "dhghghfgd" })
            .expect(HttpStatusCodes.Unauthorized)

        await request(app)
            .post(PATHS.AUTH + "/login")
            .send({ loginOrEmail: "gfdgdgsdffd", password: users[0].password })
            .expect(HttpStatusCodes.Unauthorized)

        await request(app)
            .post(PATHS.AUTH + "/login")
            .send({ password: users[0].password })
            .expect(HttpStatusCodes.BadRequest)

        await request(app)
            .post(PATHS.AUTH + "/login")
            .send({ loginOrEmail: users[0].login })
            .expect(HttpStatusCodes.BadRequest)

    })
})
