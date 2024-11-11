import express, { Request, Response } from "express"
import { blogsRouter } from "./features/blog/blogsRouter"
import { postsRouter } from "./features/posts/postsRouter"
import { PATHS } from "./lib/paths"
import { HttpStatusCodes } from "./lib/httpStatusCodes"
import { blogsCollection, postsCollection, usersCollection } from "./db/mongo"
import { usersRouter } from "./features/user/usersRouter"
import { authRouter } from "./features/auth/authRouter"

export const app = express()

app.use(express.json())
app.use(PATHS.BLOGS, blogsRouter)
app.use(PATHS.POSTS, postsRouter)
app.use(PATHS.USERS, usersRouter)
app.use(PATHS.AUTH, authRouter)

app.get(PATHS.HOME, (req: Request, res: Response) => {
    const helloPhrase = "Hometask 02, V1"
    res.send(helloPhrase)
})

app.delete(PATHS.TESTING, async (req: Request, res: Response) => {
    await blogsCollection.deleteMany()
    await postsCollection.deleteMany()
    await usersCollection.deleteMany()

    res.sendStatus(HttpStatusCodes.NoContent)
})
