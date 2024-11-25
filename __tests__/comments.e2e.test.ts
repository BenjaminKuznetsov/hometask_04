import request from "supertest"
import { app } from "../src/app"
import { paths } from "../src/common/paths"
import { HttpStatus } from "../src/common/httpStatus"
import { runTestDb } from "../src/db/mongo"
import { CreatedUser, seeder } from "./helpers/seeder"
import { PostViewModel } from "../src/features/posts/postModels"
import { TCommentInput, TCommentViewModel } from "../src/features/comments/comments.types"
import { generateText } from "./helpers/utils"
import { MongoClient, ObjectId } from "mongodb"
import _ from "lodash"
import { MongoMemoryServer } from "mongodb-memory-server"

describe("comments", () => {
    let mongoServer: MongoMemoryServer
    let mongoClient: MongoClient

    let posts: PostViewModel[]
    let users: CreatedUser[]

    beforeAll(async () => {
        const { server, client } = await runTestDb()
        mongoServer = server
        mongoClient = client

        posts = await seeder.posts(4)
        users = await seeder.users(2)

        const res1 = await request(app)
            .post(paths.auth.login)
            .send({ loginOrEmail: users[0].login, password: users[0].password })

        users[0].accessToken = res1.body.accessToken

        const res2 = await request(app)
            .post(paths.auth.login)
            .send({ loginOrEmail: users[1].login, password: users[1].password })

        users[1].accessToken = res2.body.accessToken
    })

    afterAll(async () => {
        if (mongoClient) {
            await mongoClient.close()
        }
        if (mongoServer) {
            await mongoServer.stop()
        }
    })

    describe("test one comment", () => {

        it("shouldn't create comment, because user is not authorized", async () => {
            const comment: TCommentInput = {
                content: "test comment",
            }
            await request(app)
                .post(`${paths.posts}/${posts[0].id}/comments`)
                .send(comment)
                .expect(HttpStatus.Unauthorized)
        })

        it("shouldn't not create too short comment", async () => {
            const shortComment: TCommentInput = {
                content: "agfdgdf",
            }

            await request(app)
                .post(`${paths.posts}/${posts[0].id}/comments`)
                .set("Authorization", `Bearer ${users[0].accessToken}`)
                .send(shortComment)
                .expect(HttpStatus.BadRequest)
        })

        it("shouldn't not create too long comment", async () => {
            const longComment: TCommentInput = {
                content: generateText(3003),
            }
            await request(app)
                .post(`${paths.posts}/${posts[0].id}/comments`)
                .set("Authorization", `Bearer ${users[0].accessToken}`)
                .send(longComment)
                .expect(HttpStatus.BadRequest)
        })

        it("shouldn't create comment with invalid post id", async () => {
            const comment: TCommentInput = {
                content: generateText(100),
            }
            await request(app)
                .post(`${paths.posts}/${new ObjectId().toString()}/comments`)
                .set("Authorization", `Bearer ${users[0].accessToken}`)
                .send(comment)
                .expect(HttpStatus.NotFound)
        })

        it("should create comment ", async () => {
            const comment: TCommentInput = {
                content: generateText(100),
            }
            const req = await request(app)
                .post(`${paths.posts}/${posts[0].id}/comments`)
                .set("Authorization", `Bearer ${users[0].accessToken}`)
                .send(comment)
                .expect(HttpStatus.Created)

            // const reqBody: TCommentViewModel = {
            //     id: req.body.id,
            //     content: req.body.content,
            //     commentatorInfo: {
            //         userId: req.body.commentatorInfo.userId,
            //         userLogin: req.body.commentatorInfo.userLogin,
            //     },
            //     createdAt: req.body.createdAt,
            // }

            expect(req.body).toEqual({ /*TCommentViewModel */
                id: expect.any(String),
                content: comment.content,
                commentatorInfo: {
                    userId: users[0].id,
                    userLogin: users[0].login,
                },
                createdAt: expect.any(String),
            })
        })

    })

    describe("test with two posts", () => {
        const createdCommentsPost1: TCommentViewModel[] = []
        const createdCommentsPost2: TCommentViewModel[] = []

        it("should create 7 comments for first post and 13 for second", async () => {

            for (let i = 0; i < 7; i++) {
                const comment: TCommentInput = {
                    content: generateText(_.random(20, 3000)),
                }
                const req = await request(app)
                    .post(`${paths.posts}/${posts[1].id}/comments`)
                    .set("Authorization", `Bearer ${users[0].accessToken}`)
                    .send(comment)
                    .expect(HttpStatus.Created)

                createdCommentsPost1.push(req.body)
            }

            for (let i = 0; i < 13; i++) {
                const comment: TCommentInput = {
                    content: generateText(_.random(20, 3000)),
                }
                const req = await request(app)
                    .post(`${paths.posts}/${posts[2].id}/comments`)
                    .set("Authorization", `Bearer ${users[0].accessToken}`)
                    .send(comment)
                    .expect(HttpStatus.Created)

                createdCommentsPost2.push(req.body)
            }
        })

        it("should get 7 comments for first post", async () => {
            const req = await request(app)
                .get(`${paths.posts}/${posts[1].id}/comments`)
                .expect(HttpStatus.OK)

            expect(req.body).toEqual({
                pagesCount: 1,
                page: 1,
                pageSize: 10,
                totalCount: 7,
                items: createdCommentsPost1.sort((a, b) =>
                    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
            })
        })

        it("should get first page of 10 comments for second post", async () => {
            const req = await request(app)
                .get(`${paths.posts}/${posts[2].id}/comments`)
                .expect(HttpStatus.OK)

            expect(req.body).toEqual({
                pagesCount: 2,
                page: 1,
                pageSize: 10,
                totalCount: 13,
                items: createdCommentsPost2
                    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                    .slice().splice(0, 10),
            })
        })

        it("should get second page of 3 comments for second post", async () => {
            const req = await request(app)
                .get(`${paths.posts}/${posts[2].id}/comments?pageNumber=2`)
                .expect(HttpStatus.OK)

            expect(req.body).toEqual({
                pagesCount: 2,
                page: 2,
                pageSize: 10,
                totalCount: 13,
                items: createdCommentsPost2
                    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                    .slice().splice(10),
            })
        })

    })

    describe("get, put and delete comment", () => {
        let workingComment: TCommentViewModel

        it("should create comment", async () => {
            const comment: TCommentInput = {
                content: generateText(100),
            }
            const req = await request(app)
                .post(`${paths.posts}/${posts[3].id}/comments`)
                .set("Authorization", `Bearer ${users[1].accessToken}`)
                .send(comment)
                .expect(HttpStatus.Created)

            workingComment = req.body
        })

        it("should get comment by id", async () => {
            const req = await request(app)
                .get(`${paths.comments}/${workingComment.id}`)
                .expect(HttpStatus.OK)

            expect(req.body).toEqual(workingComment)
        })

        it("shouldn't update comment, because user is not authorized", async () => {
            const comment: TCommentInput = {
                content: generateText(100),
            }
            await request(app)
                .put(`${paths.comments}/${workingComment.id}`)
                .send(comment)
                .expect(HttpStatus.Unauthorized)
        })

        it("shouldn't update comment, because user is not owner", async () => {
            const comment: TCommentInput = {
                content: generateText(100),
            }
            await request(app)
                .put(`${paths.comments}/${workingComment.id}`)
                .set("Authorization", `Bearer ${users[0].accessToken}`)
                .send(comment)
                .expect(HttpStatus.Forbidden)
        })

        it("should update comment", async () => {
            const comment: TCommentInput = {
                content: generateText(150),
            }
            await request(app)
                .put(`${paths.comments}/${workingComment.id}`)
                .set("Authorization", `Bearer ${users[1].accessToken}`)
                .send(comment)
                .expect(HttpStatus.NoContent)

            const req = await request(app)
                .get(`${paths.comments}/${workingComment.id}`)
                .expect(HttpStatus.OK)

            expect(req.body).toEqual({
                id: workingComment.id,
                content: comment.content,
                commentatorInfo: {
                    userId: users[1].id,
                    userLogin: users[1].login,
                },
                createdAt: workingComment.createdAt,
            })
        })

        it("shouldn't delete comment, because user is not authorized", async () => {
            await request(app)
                .delete(`${paths.comments}/${workingComment.id}`)
                .expect(HttpStatus.Unauthorized)
        })

        it("shouldn't delete comment, because user is not owner", async () => {
            await request(app)
                .delete(`${paths.comments}/${workingComment.id}`)
                .set("Authorization", `Bearer ${users[0].accessToken}`)
                .expect(HttpStatus.Forbidden)
        })

        it("should delete comment", async () => {
            await request(app)
                .delete(`${paths.comments}/${workingComment.id}`)
                .set("Authorization", `Bearer ${users[1].accessToken}`)
                .expect(HttpStatus.NoContent)

            await request(app)
                .get(`${paths.comments}/${workingComment.id}`)
                .expect(HttpStatus.NotFound)

        })
    })
})
