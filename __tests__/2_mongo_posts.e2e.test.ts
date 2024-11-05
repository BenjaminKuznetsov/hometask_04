import request from "supertest"
import { app } from "../src/app"
import { PATHS } from "../src/lib/paths"
import { HttpStatusCodes } from "../src/lib/httpStatusCodes"
import { invalidPosts, validBlogs, validPosts } from "../src/mock"
import { encodeToBase64 } from "../src/lib/helpers"
import { MongoMemoryServer } from "mongodb-memory-server"
import { MongoClient, ObjectId } from "mongodb"
import { BlogViewModel } from "../src/features/blog/blogModels"
import { runTestDb } from "../src/db/mongo"
import { PostViewModel } from "../src/features/posts/postModels"
import __ from "lodash"
import { isValidIsoDate } from "./helpers/utils"

const ADMIN_AUTH = "admin:qwerty"

describe("posts", () => {
    let mongoServer: MongoMemoryServer
    let mongoClient: MongoClient

    const dbBlogs: BlogViewModel[] = []
    const dbPosts: PostViewModel[] = []

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

    it("should seed blogs", async () => {
        for (const data of validBlogs) {
            const response1 = await request(app)
                .post(PATHS.BLOGS)
                .set("Authorization", `Basic ${encodeToBase64(ADMIN_AUTH)}`)
                .send(data)
                .expect(HttpStatusCodes.Created)

            const createdBlog = response1.body
            dbBlogs.push(createdBlog)
        }
        expect(dbBlogs.length).toBe(validBlogs.length)
    })

    it("shouldn't create post, because user is not authorized", async () => {
        const data = validPosts[0]
        await request(app).post(PATHS.POSTS).send(data).expect(HttpStatusCodes.Unauthorized)
    })

    it("shouldn't create post with incorrect auth credentials", async () => {
        const data = validPosts[0]
        await request(app)
            .post(PATHS.POSTS)
            .set("Authorization", `Basic qwerty:qwerty`)
            .send(data)
            .expect(HttpStatusCodes.Unauthorized)
    })

    it("shouldn't create post with incorrect input data", async () => {
        for (const data of invalidPosts) {
            const response = await request(app)
                .post(PATHS.POSTS)
                .set("Authorization", `Basic ${encodeToBase64(ADMIN_AUTH)}`)
                .send(data)
                .expect(HttpStatusCodes.BadRequest)
            // console.log(JSON.stringify(response.body, null, 2))
        }
    })

    it("shouldn`t create post with incorrect blog id", async () => {
        const data = validPosts[0]
        data.blogId = new ObjectId().toString()
        await request(app)
            .post(PATHS.POSTS)
            .set("Authorization", `Basic ${encodeToBase64(ADMIN_AUTH)}`)
            .send(data)
            .expect(HttpStatusCodes.BadRequest)
    })

    it("should create some posts and then find it by id", async () => {
        for (const data of validPosts) {
            const blog: BlogViewModel = __.sample(dbBlogs) as BlogViewModel
            expect(blog).toBeDefined()

            const response1 = await request(app)
                .post(PATHS.POSTS)
                .set("Authorization", `Basic ${encodeToBase64(ADMIN_AUTH)}`)
                .send({ ...data, blogId: blog.id })
                .expect(HttpStatusCodes.Created)

            // console.log(response1.body)

            const createdPost = response1.body
            expect(createdPost.id).toBeDefined()
            expect(createdPost.title).toBe(data.title)
            expect(createdPost.shortDescription).toBe(data.shortDescription)
            expect(createdPost.content).toBe(data.content)
            expect(createdPost.blogId).toBe(blog.id)
            expect(createdPost.blogName).toBe(blog.name)
            expect(isValidIsoDate(createdPost.createdAt)).toBe(true)

            const response2 = await request(app)
                .get(`${PATHS.POSTS}/${createdPost.id}`)
                .expect(HttpStatusCodes.OK)
            const foundBlog = response2.body

            expect(foundBlog.id).toBe(createdPost.id)
            dbPosts.push(foundBlog)
        }
    })

    it("shouldn't find post with non-existent id", async () => {
        const id = new ObjectId().toString()
        await request(app).get(`${PATHS.POSTS}/${id}`).expect(HttpStatusCodes.NotFound)
    })

    it("should return all posts", async () => {
        const response = await request(app).get(PATHS.POSTS).expect(HttpStatusCodes.OK)
        const returnedPosts = response.body
        expect(returnedPosts).toHaveLength(validPosts.length)
    })

    it("shouldn't update post, because user is not authorized", async () => {
        const id = new ObjectId().toString()
        const data = validPosts[0]
        await request(app).put(`${PATHS.POSTS}/${id}`).send(data).expect(HttpStatusCodes.Unauthorized)
    })

    it("shouldn't update post with incorrect input data", async () => {
        for (const data of invalidPosts) {
            const id = dbPosts[0].id
            const response = await request(app)
                .put(`${PATHS.POSTS}/${id}`)
                .set("Authorization", `Basic ${encodeToBase64(ADMIN_AUTH)}`)
                .send(data)
                .expect(HttpStatusCodes.BadRequest)
            // console.log(JSON.stringify(response.body, null, 2))
        }
    })

    it("shouldn't update post with non-existent id", async () => {
        const postId = new ObjectId().toString()
        const data = validPosts[0]
        data.blogId = dbBlogs[0].id
        const res = await request(app)
            .put(`${PATHS.POSTS}/${postId}`)
            .set("Authorization", `Basic ${encodeToBase64(ADMIN_AUTH)}`)
            .send(data)
            .expect(HttpStatusCodes.NotFound)
        // console.log("res", res.body)
    })

    it("shouldn't update post with incorrect blog id", async () => {
        const postId = dbPosts[0].id
        const data = validPosts[2]
        data.blogId = new ObjectId().toString()
        const res = await request(app)
            .put(`${PATHS.POSTS}/${postId}`)
            .set("Authorization", `Basic ${encodeToBase64(ADMIN_AUTH)}`)
            .send(data)
            .expect(HttpStatusCodes.BadRequest)
        // console.log(res.body)
    })

    it("should update post with correct data", async () => {
        const post = dbPosts[0]
        const data = validPosts[2]
        const blog: BlogViewModel = dbBlogs.find(blog => blog.id === post.blogId) as BlogViewModel
        expect(blog).toBeDefined()

        await request(app)
            .put(`${PATHS.POSTS}/${post.id}`)
            .set("Authorization", `Basic ${encodeToBase64(ADMIN_AUTH)}`)
            .send({ ...data, blogId: blog.id })
            .expect(HttpStatusCodes.NoContent)

        const res2 = await request(app)
            .get(`${PATHS.POSTS}/${post.id}`)
            .expect(HttpStatusCodes.OK)

        const updatedPost = res2.body

        expect(updatedPost.id).toBe(post.id)
        expect(updatedPost.title).toBe(data.title)
        expect(updatedPost.shortDescription).toBe(data.shortDescription)
        expect(updatedPost.content).toBe(data.content)
        expect(updatedPost.blogId).toBe(blog.id)
        expect(updatedPost.blogName).toBe(blog.name)
    })

    it("shouldn't delete post, because user is not authorized", async () => {
        const postId = dbPosts[0].id
        await request(app).delete(`${PATHS.POSTS}/${postId}`).expect(HttpStatusCodes.Unauthorized)
    })

    it("shouldn't delete post with non-existent id", async () => {
        const postId = new ObjectId().toString()
        await request(app)
            .delete(`${PATHS.POSTS}/${postId}`)
            .set("Authorization", `Basic ${encodeToBase64(ADMIN_AUTH)}`)
            .expect(HttpStatusCodes.NotFound)
    })

    it("should delete post with correct id", async () => {
        const postId = dbPosts[0].id
        await request(app)
            .delete(`${PATHS.POSTS}/${postId}`)
            .set("Authorization", `Basic ${encodeToBase64(ADMIN_AUTH)}`)
            .expect(HttpStatusCodes.NoContent)
    })
})
