import request from "supertest"
import { app } from "../src/app"
import { PATHS } from "../src/lib/paths"
import { HttpStatusCodes } from "../src/lib/httpStatusCodes"
import { invalidBlogs, validBlogs } from "../src/mock"
import { encodeToBase64 } from "../src/lib/helpers"
import { runTestDb } from "../src/db/mongo"
import { MongoMemoryServer } from "mongodb-memory-server"
import { MongoClient, ObjectId } from "mongodb"
import { BlogViewModel } from "../src/features/blog/blogModels"
import { isValidIsoDate } from "./helpers/utils"

const ADMIN_AUTH = "admin:qwerty"

describe("blogs", () => {
    let mongoServer: MongoMemoryServer
    let mongoClient: MongoClient

    const dbBlogs: BlogViewModel[] = []

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

    it("should successfully set & get information from the database", async () => {
        const db = mongoClient.db(mongoServer.instanceInfo!.dbName)
        expect(db).toBeDefined()
        const col = db.collection("test")
        const result = await col.insertMany([ { a: 1 }, { b: 1 } ])
        expect(result.insertedCount).toStrictEqual(2)
        expect(await col.countDocuments({})).toBe(2)
    })

    it("should return status 200 and empty array", async () => {
        await request(app).get(PATHS.BLOGS).expect(HttpStatusCodes.OK, [])
    })

    it("shouldn't create blog, because user is not authorized", async () => {
        const data = validBlogs[0]
        await request(app).post(PATHS.BLOGS).send(data).expect(HttpStatusCodes.Unauthorized)
    })

    it("shouldn't create blog with incorrect auth credentials", async () => {
        const newBlog = validBlogs[0]
        await request(app)
            .post(PATHS.BLOGS)
            .set("Authorization", "Basic qwerty:qwerty")
            .send(newBlog)
            .expect(HttpStatusCodes.Unauthorized)
    })

    it("shouldn't create blog with incorrect input data", async () => {
        for (const data of invalidBlogs) {
            await request(app)
                .post(PATHS.BLOGS)
                .set("Authorization", `Basic ${encodeToBase64(ADMIN_AUTH)}`)
                .send(data)
                .expect(HttpStatusCodes.BadRequest)
        }
    })

    it("should create some blogs and then find it by id", async () => {
        for (const data of validBlogs) {
            const response1 = await request(app)
                .post(PATHS.BLOGS)
                .set("Authorization", `Basic ${encodeToBase64(ADMIN_AUTH)}`)
                .send(data)
                .expect(HttpStatusCodes.Created)

            const createdBlog = response1.body
            expect(createdBlog.id).toBeDefined()
            expect(createdBlog.name).toBe(data.name)
            expect(createdBlog.description).toBe(data.description)
            expect(createdBlog.websiteUrl).toBe(data.websiteUrl)
            expect(isValidIsoDate(createdBlog.createdAt)).toBe(true)
            expect(createdBlog.isMembership).toBe(false)

            const response2 = await request(app)
                .get(`${PATHS.BLOGS}/${createdBlog.id}`)
                .expect(HttpStatusCodes.OK)
            const foundBlog = response2.body

            expect(foundBlog.id).toBe(createdBlog.id)
            dbBlogs.push(foundBlog)
        }
    })

    it("shouldn't find blog with non-existent id", async () => {
        const id = new ObjectId().toString()
        await request(app).get(`${PATHS.BLOGS}/${id}`).expect(HttpStatusCodes.NotFound)
    })

    it("should return all blogs", async () => {
        const response = await request(app).get(PATHS.BLOGS).expect(HttpStatusCodes.OK)
        const returnedBlogs = response.body
        expect(returnedBlogs).toHaveLength(validBlogs.length)
    })

    it("shouldn't update blog, because user is not authorized", async () => {
        const blogId = dbBlogs[0].id
        const data = validBlogs[5]
        await request(app).put(`${PATHS.BLOGS}/${blogId}`).send(data).expect(HttpStatusCodes.Unauthorized)
    })

    it("shouldn't update blog with incorrect input data", async () => {
        for (const data of invalidBlogs) {
            const blogId = dbBlogs[0].id
            const response = await request(app)
                .put(`${PATHS.BLOGS}/${blogId}`)
                .set("Authorization", `Basic ${encodeToBase64(ADMIN_AUTH)}`)
                .send(data)
                .expect(HttpStatusCodes.BadRequest)
            // console.log(JSON.stringify(response.body, null, 2))
        }
    })

    it("shouldn't update blog with non-existent id", async () => {
        const blogId = new ObjectId().toString()
        const data = validBlogs[0]
        await request(app)
            .put(`${PATHS.BLOGS}/${blogId}`)
            .set("Authorization", `Basic ${encodeToBase64(ADMIN_AUTH)}`)
            .send(data)
            .expect(HttpStatusCodes.NotFound)
    })

    it("should update blog with correct data", async () => {
        const blogId = dbBlogs[0].id
        const data = validBlogs[0]
        await request(app)
            .put(`${PATHS.BLOGS}/${blogId}`)
            .set("Authorization", `Basic ${encodeToBase64(ADMIN_AUTH)}`)
            .send(data)
            .expect(HttpStatusCodes.NoContent)

        const response = await request(app)
            .get(`${PATHS.BLOGS}/${blogId}`)
            .expect(HttpStatusCodes.OK)
        const updatedBlog = response.body

        expect(updatedBlog.id).toBe(blogId)
        expect(updatedBlog.name).toBe(data.name)
        expect(updatedBlog.description).toBe(data.description)
        expect(updatedBlog.websiteUrl).toBe(data.websiteUrl)
    })

    it("shouldn't delete blog, because user is not authorized", async () => {
        const blogId = dbBlogs[0].id
        await request(app).delete(`${PATHS.BLOGS}/${blogId}`).expect(HttpStatusCodes.Unauthorized)
    })

    it("shouldn't delete blog with non-existent id", async () => {
        const blogId = new ObjectId().toString()
        await request(app)
            .delete(`${PATHS.BLOGS}/${blogId}`)
            .set("Authorization", `Basic ${encodeToBase64(ADMIN_AUTH)}`)
            .expect(HttpStatusCodes.NotFound)
    })

    it("should delete blog with correct id", async () => {
        const blogId = dbBlogs[0].id
        await request(app)
            .delete(`${PATHS.BLOGS}/${blogId}`)
            .set("Authorization", `Basic ${encodeToBase64(ADMIN_AUTH)}`)
            .expect(HttpStatusCodes.NoContent)

        const response = await request(app).get(PATHS.BLOGS).expect(HttpStatusCodes.OK)
        const returnedBlogs = response.body
        expect(returnedBlogs).toHaveLength(dbBlogs.length - 1)
    })
})
