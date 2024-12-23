import express, { Request, Response } from "express"
import { blogsRouter } from "./features/blog/api/blogs.router"
import { postsRouter } from "./features/posts/api/posts.router"
import { paths } from "./common/paths"
import { HttpStatus } from "./common/httpStatus"
import { db } from "./db/mongo"
import { usersRouter } from "./features/user/api/usersRouter"
import { authRouter } from "./features/auth/api/auth.router"
import { commentsRouter } from "./features/comments/api/comments.router"
import cookieParser from "cookie-parser"
import { bruteForceGuard } from "./common/middleware/bruteForceGuard"
import { registrator } from "./common/middleware/registrator"
import { sessionsRouter } from "./features/sessions/api/sessions.router"

export const app = express()

app.set("trust proxy", true)

app.use(express.json())
app.use(cookieParser())
app.use(bruteForceGuard)
app.use(registrator)

app.use(paths.blogs, blogsRouter)
app.use(paths.posts, postsRouter)
app.use(paths.users, usersRouter)
app.use(paths.auth.root, authRouter)
app.use(paths.sessions, sessionsRouter)
app.use(paths.comments, commentsRouter)

app.get(paths.home, (req: Request, res: Response) => {
    const helloPhrase = "Home task 02, V1"
    res.send(helloPhrase)
})

app.delete(paths.testing, async (req: Request, res: Response) => {
    await db.drop()
    res.sendStatus(HttpStatus.NoContent)
})
