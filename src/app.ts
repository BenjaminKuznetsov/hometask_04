import express, { Request, Response } from "express"
import { blogsRouter } from "./features/blog/blogsRouter"
import { postsRouter } from "./features/posts/posts.router"
import { paths } from "./common/paths"
import { HttpStatus } from "./common/httpStatus"
import {
    blogsCollection,
    commentsCollection,
    invalidTokensCollection,
    postsCollection,
    usersCollection,
} from "./db/mongo"
import { usersRouter } from "./features/user/usersRouter"
import { authRouter } from "./features/auth/auth.router"
import { commentsRouter } from "./features/comments/comments.router"
import cookieParser from "cookie-parser"

export const app = express()

app.use(express.json())
app.use(cookieParser())

app.use(paths.blogs, blogsRouter)
app.use(paths.posts, postsRouter)
app.use(paths.users, usersRouter)
app.use(paths.auth.root, authRouter)
app.use(paths.comments, commentsRouter)

app.get(paths.home, (req: Request, res: Response) => {
    const helloPhrase = "Home task 02, V1"
    res.send(helloPhrase)
})

app.delete(paths.testing, async (req: Request, res: Response) => {
    await blogsCollection.deleteMany()
    await postsCollection.deleteMany()
    await usersCollection.deleteMany()
    await commentsCollection.deleteMany()
    await invalidTokensCollection.deleteMany()

    res.sendStatus(HttpStatus.NoContent)
})
