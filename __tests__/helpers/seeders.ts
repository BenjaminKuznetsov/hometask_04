import request from "supertest"
import { app } from "../../src/app"
import { paths } from "../../src/common/paths"
import { encodeToBase64 } from "../../src/common/helpers"
import { mockUsers, validBlogs, validPosts } from "./mock-data"
import { HttpStatus } from "../../src/common/httpStatus"
import { appConfig } from "../../src/common/config/config"
import { BlogViewModel } from "../../src/features/blog/domain/blog.model"
import { PostInputModel, PostViewModel } from "../../src/features/posts/domain/post.model"

export type CreatedUser = {
    id: string
    email: string
    login: string
    password: string
    createdAt: string
    accessToken?: string
}

export const e2eSeeder = {
    async users(count: number): Promise<CreatedUser[]> {
        const createdUsers: CreatedUser[] = []

        let mockUserInd = 0

        for (let i = 0; i < count; i++) {

            let user = mockUsers[mockUserInd]

            if (!user) {
                mockUserInd = 0
                user = mockUsers[mockUserInd]
            }

            const req = await request(app)
                .post(paths.users)
                .set("Authorization", `Basic ${encodeToBase64(appConfig.adminAuth)}`)
                .send(user)

            /* const reqBody: UserViewModel = {
                 id: req.body.id,
                 email: req.body.email,
                 login: req.body.login,
                 createdAt: req.body.createdAt,
             }*/

            const createdUser = {
                id: req.body.id,
                email: req.body.email,
                login: req.body.login,
                createdAt: req.body.createdAt,
                password: user.password,
            }

            createdUsers.push(createdUser)

            mockUserInd++
        }

        return createdUsers
    },

    async blogs(count: number): Promise<BlogViewModel[]> {
        const createdBlogs: BlogViewModel[] = []

        for (let i = 0; i < count; i++) {

            const blog = validBlogs[i]

            if (!blog) break

            const req = await request(app)
                .post(paths.blogs)
                .set("Authorization", `Basic ${encodeToBase64(appConfig.adminAuth)}`)
                .send(blog)
                .expect(HttpStatus.Created)

            expect(req.body).toEqual({
                id: expect.any(String),
                name: blog.name,
                description: blog.description,
                websiteUrl: blog.websiteUrl,
                createdAt: expect.any(String),
                isMembership: expect.any(Boolean),
            })

            const createdBlog: BlogViewModel = {
                id: req.body.id,
                name: req.body.name,
                description: req.body.description,
                websiteUrl: req.body.websiteUrl,
                createdAt: req.body.createdAt,
                isMembership: req.body.isMembership,
            }

            createdBlogs.push(createdBlog)
        }

        return createdBlogs
    },

    async posts(count: number): Promise<PostViewModel[]> {
        const [ blog ] = await this.blogs(1)

        const createdPosts: PostViewModel[] = []

        for (let i = 0; i < count; i++) {
            const post = validPosts[i]

            if (!post) break

            const postInput: PostInputModel = {
                blogId: blog.id,
                content: post.content,
                shortDescription: post.shortDescription,
                title: post.title,
            }

            const req = await request(app)
                .post(paths.posts)
                .set("Authorization", `Basic ${encodeToBase64(appConfig.adminAuth)}`)
                .send(postInput)
                .expect(HttpStatus.Created)

            expect(req.body).toEqual({
                id: expect.any(String),
                title: post.title,
                shortDescription: post.shortDescription,
                content: post.content,
                blogId: blog.id,
                blogName: blog.name,
                createdAt: expect.any(String),
            })

            const createdPost: PostViewModel = {
                id: req.body.id,
                title: post.title,
                shortDescription: post.shortDescription,
                content: post.content,
                blogId: blog.id,
                blogName: blog.name,
                createdAt: req.body.createdAt,
            }

            createdPosts.push(createdPost)
        }
        return createdPosts
    },
}

export const integrationSeeder = {}