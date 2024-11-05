import express, { Request, Response } from "express"
import { blogsRouter } from "./features/blog/blogsRouter"
import { postsRouter } from "./features/posts/postsRouter"
import { PATHS } from "./lib/paths"
import { HttpStatusCodes } from "./lib/httpStatusCodes"
import { blogsCollection, postsCollection } from "./db/mongo"

export const app = express()

app.use(express.json())
app.use(PATHS.BLOGS, blogsRouter)
app.use(PATHS.POSTS, postsRouter)

app.get(PATHS.HOME, (req: Request, res: Response) => {
    const helloPhrase = "Hometask 02, V1"
    res.send(helloPhrase)
})

app.delete(PATHS.TESTING, async (req: Request, res: Response) => {
    await blogsCollection.deleteMany()
    await postsCollection.deleteMany()

    res.sendStatus(HttpStatusCodes.NoContent)
})
