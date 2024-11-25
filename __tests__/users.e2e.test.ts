import request from "supertest"
import { app } from "../src/app"
import { paths } from "../src/common/paths"
import { HttpStatus } from "../src/common/httpStatus"
import { users } from "./helpers/mock-data"
import { encodeToBase64 } from "../src/common/helpers"
import { runTestDb } from "../src/db/mongo"
import { UserInputModel } from "../src/features/user/userModels"
import { appConfig } from "../src/common/config/config"
import { MongoMemoryServer } from "mongodb-memory-server"
import { MongoClient } from "mongodb"

describe("users", () => {
    let mongoServer: MongoMemoryServer
    let mongoClient: MongoClient

    beforeAll(async () => {
        const { server, client } = await runTestDb()
        mongoServer = server
        mongoClient = client
    })

    afterAll(async () => {
        if (mongoClient) {
            await mongoClient.close()
        }
        if (mongoServer) {
            await mongoServer.stop()
        }
    })

    beforeEach(async () => {
        await request(app).delete(paths.testing)
    })

    it("shouldn't accept unauthenticated requests", async () => {

        await request(app).post(paths.users).send(users[0]).expect(HttpStatus.Unauthorized)

        await request(app)
            .post(paths.users)
            .set("Authorization", `Basic qwerty:qwerty`)
            .send(users[0])
            .expect(HttpStatus.Unauthorized)
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
            .post(paths.users)
            .set("Authorization", `Basic ${encodeToBase64(appConfig.adminAuth)}`)
            .send(data1)
            .expect(HttpStatus.BadRequest)

        const res2 = await request(app)
            .post(paths.users)
            .set("Authorization", `Basic ${encodeToBase64(appConfig.adminAuth)}`)
            .send(data2)
            .expect(HttpStatus.BadRequest)

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
            .post(paths.users)
            .set("Authorization", `Basic ${encodeToBase64(appConfig.adminAuth)}`)
            .send(data)
            .expect(HttpStatus.Created)

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
            .post(paths.users)
            .set("Authorization", `Basic ${encodeToBase64(appConfig.adminAuth)}`)
            .send(data1)
            .expect(HttpStatus.BadRequest)

        expect(res1.body).toEqual({
            errorsMessages: [ {
                field: "login",
                message: expect.any(String),
            } ],
        })

        const res2 = await request(app)
            .post(paths.users)
            .set("Authorization", `Basic ${encodeToBase64(appConfig.adminAuth)}`)
            .send(data2)
            .expect(HttpStatus.BadRequest)

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
                .post(paths.users)
                .set("Authorization", `Basic ${encodeToBase64(appConfig.adminAuth)}`)
                .send(user)
                .expect(HttpStatus.Created)
            // console.log("res", res.body)
        }

        const response = await request(app)
            .get(paths.users)
            .set("Authorization", `Basic ${encodeToBase64(appConfig.adminAuth)}`)
            .expect(HttpStatus.OK)

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
            .get(paths.users + "?searchLoginTerm=s&sortBy=login")
            .set("Authorization", `Basic ${encodeToBase64(appConfig.adminAuth)}`)
            .expect(HttpStatus.OK)

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
            .get(paths.users + "?searchEmailTerm=an&sortBy=loginsortDirection=asc")
            .set("Authorization", `Basic ${encodeToBase64(appConfig.adminAuth)}`)
            .expect(HttpStatus.OK)

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
                .post(paths.users)
                .set("Authorization", `Basic ${encodeToBase64(appConfig.adminAuth)}`)
                .send(user)
                .expect(HttpStatus.Created)

            ids.push(res.body.id)
        }

        const response = await request(app)
            .delete(paths.users + "/" + ids[0])
            .set("Authorization", `Basic ${encodeToBase64(appConfig.adminAuth)}`)
            .expect(HttpStatus.NoContent)

        const response1 = await request(app)
            .get(paths.users)
            .set("Authorization", `Basic ${encodeToBase64(appConfig.adminAuth)}`)
            .expect(HttpStatus.OK)

        expect(response1.body.totalCount).toBe(4)

        const response2 = await request(app)
            .delete(paths.users + "/111")
            .set("Authorization", `Basic ${encodeToBase64(appConfig.adminAuth)}`)
            .expect(HttpStatus.NotFound)
    })

})
