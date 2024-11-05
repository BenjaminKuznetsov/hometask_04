import request from "supertest"
import { app } from "../src/app"
import { PATHS } from "../src/lib/paths"
import { HttpStatusCodes } from "../src/lib/httpStatusCodes"
import { validBlogs, validPosts, invalidPosts } from "../src/mock"
import { encodeToBase64 } from "../src/lib/helpers"
import { clearDb } from "./helpers/clearDb"
import { seedDb } from "./helpers/seedDb"

const ADMIN_AUTH = "admin:qwerty"

describe("posts", () => {
  describe("preparation", () => {
    beforeAll(() => {
      clearDb()
      seedDb(["blogs"])
    })

    it("should return all blogs", async () => {
      const response = await request(app).get(PATHS.BLOGS).expect(HttpStatusCodes.OK)
      const returnedBlogs = response.body
      // console.log("returnedBlogs", returnedBlogs)
      expect(returnedBlogs).toHaveLength(validBlogs.length)
    })
  })

  describe("Create, get by id", () => {
    // beforeAll(async () => {
    //   await new Promise<void>((resolve) => resolve())
    // })

    it("shouldn't create post, because user is not authorized", async () => {
      const newPost = validPosts[0]
      await request(app).post(PATHS.POSTS).send(newPost).expect(HttpStatusCodes.Unauthorized)
    })

    it("shouldn't create post with incorrect auth credentials", async () => {
      const newPost = validPosts[0]
      await request(app)
        .post(PATHS.POSTS)
        .set("Authorization", `Basic qwerty:qwerty`)
        .send(newPost)
        .expect(HttpStatusCodes.Unauthorized)
    })

    it("should create 2 posts and find post by id", async () => {
      const newPost1 = validPosts[0]
      const res = await request(app).get(`${PATHS.BLOGS}/${newPost1.blogId}`)
      const blog1 = res.body
      //   console.log("blog1", blog1)
      const newPost2 = validPosts[1]
      //   console.log("newPost1", newPost1)

      const response1 = await request(app)
        .post(PATHS.POSTS)
        .set("Authorization", `Basic ${encodeToBase64(ADMIN_AUTH)}`)
        .send(newPost1)
        .expect(HttpStatusCodes.Created)
      //   console.log("response1", response1.body)
      //   expect(response1.status).toBe(HttpStatusCodes.Created)

      const createdPost1 = response1.body
      expect(createdPost1.id).toBe("1")
      expect(createdPost1.title).toBe(newPost1.title)
      expect(createdPost1.shortDescription).toBe(newPost1.shortDescription)
      expect(createdPost1.content).toBe(newPost1.content)
      expect(createdPost1.blogId).toBe(newPost1.blogId)
      // @ts-ignore
      expect(createdPost1.blogName).toBe(blog1.name)

      const response2 = await request(app)
        .post(PATHS.POSTS)
        .set("Authorization", `Basic ${encodeToBase64(ADMIN_AUTH)}`)
        .send(newPost2)
        .expect(HttpStatusCodes.Created)
      const createdPost2 = response2.body
      expect(createdPost2.id).toBe("2")

      const res3 = await request(app).get(`${PATHS.POSTS}/${createdPost1.id}`).expect(HttpStatusCodes.OK)
      const foundPost = res3.body
      expect(foundPost.id).toBe(createdPost1.id)
      expect(foundPost.title).toBe(createdPost1.title)
      expect(foundPost.shortDescription).toBe(createdPost1.shortDescription)
      expect(foundPost.content).toBe(createdPost1.content)
      expect(foundPost.blogId).toBe(createdPost1.blogId)
      expect(foundPost.blogName).toBe(createdPost1.blogName)
    })

    it("shouldn't find post with non-existent id", async () => {
      await request(app).get(`${PATHS.POSTS}/100500`).expect(HttpStatusCodes.NotFound)
    })

    it("shouldn't create post with incorrect input data", async () => {
      for (const el of invalidPosts) {
        const response = await request(app)
          .post(PATHS.POSTS)
          .set("Authorization", `Basic ${encodeToBase64(ADMIN_AUTH)}`)
          .send(el)
          .expect(HttpStatusCodes.BadRequest)
        // console.log(JSON.stringify(response.body, null, 2))
      }
    })

    it("shouldn`t create post with incorrect blog id", async () => {
      const newPost = validPosts[0]
      newPost.blogId = "100500"
      await request(app)
        .post(PATHS.POSTS)
        .set("Authorization", `Basic ${encodeToBase64(ADMIN_AUTH)}`)
        .send(newPost)
        .expect(HttpStatusCodes.BadRequest)
    })
  })

  describe("Update and delete", () => {
    it("start", async () => {
      clearDb(["posts"])
      seedDb(["posts"])
    })

    it("should return all posts", async () => {
      const response = await request(app).get(PATHS.POSTS).expect(HttpStatusCodes.OK)
      const returnedPosts = response.body
      // console.log("response.body", response.body)
      expect(returnedPosts).toHaveLength(validPosts.length)
    })

    it("shouldn't update post, because user is not authorized", async () => {
      const updatedPost = validPosts[0]
      await request(app).put(`${PATHS.POSTS}/1`).send(updatedPost).expect(HttpStatusCodes.Unauthorized)
    })

    it("shouldn't update post with incorrect input data", async () => {
      for (const el of invalidPosts) {
        const response = await request(app)
          .put(`${PATHS.POSTS}/5`)
          .set("Authorization", `Basic ${encodeToBase64(ADMIN_AUTH)}`)
          .send(el)
          .expect(HttpStatusCodes.BadRequest)
        // console.log(JSON.stringify(response.body, null, 2))
      }
    })

    it("shouldn't update post with non-existent id", async () => {
      const updatedPost = validPosts[0]
      updatedPost.blogId = "1"
      const res = await request(app)
        .put(`${PATHS.POSTS}/100500`)
        .set("Authorization", `Basic ${encodeToBase64(ADMIN_AUTH)}`)
        .send(updatedPost)
        .expect(HttpStatusCodes.NotFound)
      // console.log("res", res.body)
    })

    it("should update post with correct data", async () => {
      const updatedPost = validPosts[2]
      const res = await request(app)
        .put(`${PATHS.POSTS}/1`)
        .set("Authorization", `Basic ${encodeToBase64(ADMIN_AUTH)}`)
        .send(updatedPost)
        .expect(HttpStatusCodes.NoContent)

      // console.log("res.body", res.body)

      // expect(res.status).toBe(HttpStatusCodes.NoContent)
    })

    it("shouldn't update post with incorrect blog id", async () => {
      const updatedPost = validPosts[2]
      updatedPost.blogId = "100500"
      const res = await request(app)
        .put(`${PATHS.POSTS}/1`)
        .set("Authorization", `Basic ${encodeToBase64(ADMIN_AUTH)}`)
        .send(updatedPost)
        .expect(HttpStatusCodes.BadRequest)
      // console.log(res.body)
    })

    it("shouldn't delete post, because user is not authorized", async () => {
      await request(app).delete(`${PATHS.POSTS}/1`).expect(HttpStatusCodes.Unauthorized)
    })

    it("shouldn't delete post with non-existent id", async () => {
      await request(app)
        .delete(`${PATHS.POSTS}/100500`)
        .set("Authorization", `Basic ${encodeToBase64(ADMIN_AUTH)}`)
        .expect(HttpStatusCodes.NotFound)
    })

    it("should delete post with correct id", async () => {
      await request(app)
        .delete(`${PATHS.POSTS}/1`)
        .set("Authorization", `Basic ${encodeToBase64(ADMIN_AUTH)}`)
        .expect(HttpStatusCodes.NoContent)
    })
  })
})
