import request from "supertest"
import { app } from "../src/app"
import { PATHS } from "../src/lib/paths"
import { HttpStatusCodes } from "../src/lib/httpStatusCodes"
import { invalidBlogs, validBlogs } from "../src/mock"
import { encodeToBase64 } from "../src/lib/helpers"
import { clearDb } from "./helpers/clearDb"
import { seedDb } from "./helpers/seedDb"

const ADMIN_AUTH = "admin:qwerty"

describe("blogs", () => {
    describe("preparation", () => {
        beforeAll(() => {
            clearDb()
        })
        it("should return status 200 and empty array", async () => {
            await request(app).get(PATHS.BLOGS).expect(HttpStatusCodes.OK, [])
        })
    })

    describe("Create, get by id", () => {
        it("shouldn't create blog, because user is not authorized", async () => {
            const newBlog = validBlogs[0]
            await request(app).post(PATHS.BLOGS).send(newBlog).expect(HttpStatusCodes.Unauthorized)
        })

        it("shouldn't create blog with incorrect auth credentials", async () => {
            const newBlog = validBlogs[0]
            await request(app)
                .post(PATHS.BLOGS)
                .set("Authorization", "Basic qwerty:qwerty")
                .send(newBlog)
                .expect(HttpStatusCodes.Unauthorized)
        })

        describe("create two blogs and find by id", () => {
            const newBlog1 = validBlogs[0]
            const newBlog2 = validBlogs[1]

            it("should create 2 blogs and find blog by id", async () => {
                const response1 = await request(app)
                    .post(PATHS.BLOGS)
                    .set("Authorization", `Basic ${encodeToBase64(ADMIN_AUTH)}`)
                    .send(newBlog1)
                    .expect(HttpStatusCodes.Created)
                const createdBlog1 = response1.body
                expect(createdBlog1.id).toBe("1")
                expect(createdBlog1.name).toBe(newBlog1.name)
                expect(createdBlog1.description).toBe(newBlog1.description)
                expect(createdBlog1.websiteUrl).toBe(newBlog1.websiteUrl)

                const response2 = await request(app)
                    .post(PATHS.BLOGS)
                    .set("Authorization", `Basic ${encodeToBase64(ADMIN_AUTH)}`)
                    .send(newBlog2)
                    .expect(HttpStatusCodes.Created)
                const createdBlog2 = response2.body
                expect(createdBlog2.id).toBe("2")

                const res3 = await request(app).get(`${PATHS.BLOGS}/${createdBlog1.id}`).expect(HttpStatusCodes.OK)
                const foundBlog1 = res3.body
                expect(foundBlog1.id).toBe(createdBlog1.id)
                expect(foundBlog1.name).toBe(createdBlog1.name)
                expect(foundBlog1.description).toBe(createdBlog1.description)
                expect(foundBlog1.websiteUrl).toBe(createdBlog1.websiteUrl)
            })

            it("shouldn't find blog with non-existent id", async () => {
                await request(app).get(`${PATHS.BLOGS}/100500`).expect(HttpStatusCodes.NotFound)
            })
        })

        it("shouldn't create blog with incorrect input data", async () => {
            for (const el of invalidBlogs) {
                const response = await request(app)
                    .post(PATHS.BLOGS)
                    .set("Authorization", `Basic ${encodeToBase64(ADMIN_AUTH)}`)
                    .send(el)
                    .expect(HttpStatusCodes.BadRequest)
                // console.log(JSON.stringify(response.body, null, 2))
            }
        })
    })

    describe("Update and delete", () => {
        beforeAll(() => {
            clearDb()
            seedDb([ "blogs" ])
        })

        it("should return all blogs", async () => {
            const response = await request(app).get(PATHS.BLOGS).expect(HttpStatusCodes.OK)
            const returnedBlogs = response.body
            expect(returnedBlogs).toHaveLength(validBlogs.length)
        })

        it("shouldn't update blog, because user is not authorized", async () => {
            const updatedBlog = validBlogs[0]
            await request(app).put(`${PATHS.BLOGS}/1`).send(updatedBlog).expect(HttpStatusCodes.Unauthorized)
        })

        it("shouldn't update blog with incorrect input data", async () => {
            for (const el of invalidBlogs) {
                const response = await request(app)
                    .put(`${PATHS.BLOGS}/5`)
                    .set("Authorization", `Basic ${encodeToBase64(ADMIN_AUTH)}`)
                    .send(el)
                    .expect(HttpStatusCodes.BadRequest)
                // console.log(JSON.stringify(response.body, null, 2))
            }
        })

        it("shouldn't update blog with non-existent id", async () => {
            const updatedBlog = validBlogs[0]
            await request(app)
                .put(`${PATHS.BLOGS}/100500`)
                .set("Authorization", `Basic ${encodeToBase64(ADMIN_AUTH)}`)
                .send(updatedBlog)
                .expect(HttpStatusCodes.NotFound)
        })

        it("should update blog with correct data", async () => {
            const updatedBlog = validBlogs[0]
            await request(app)
                .put(`${PATHS.BLOGS}/1`)
                .set("Authorization", `Basic ${encodeToBase64(ADMIN_AUTH)}`)
                .send(updatedBlog)
                .expect(HttpStatusCodes.NoContent)
        })

        it("shouldn't delete blog, because user is not authorized", async () => {
            await request(app).delete(`${PATHS.BLOGS}/1`).expect(HttpStatusCodes.Unauthorized)
        })

        it("shouldn't delete blog with non-existent id", async () => {
            await request(app)
                .delete(`${PATHS.BLOGS}/100500`)
                .set("Authorization", `Basic ${encodeToBase64(ADMIN_AUTH)}`)
                .expect(HttpStatusCodes.NotFound)
        })

        it("should delete blog with correct id", async () => {
            await request(app)
                .delete(`${PATHS.BLOGS}/1`)
                .set("Authorization", `Basic ${encodeToBase64(ADMIN_AUTH)}`)
                .expect(HttpStatusCodes.NoContent)
        })
    })
})
