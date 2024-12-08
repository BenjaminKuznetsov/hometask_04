import { Collection, Db, MongoClient } from "mongodb"
import { BlogDBModel } from "../features/blog/blogModels"
import { PostDBModel } from "../features/posts/postModels"
import { MongoMemoryServer } from "mongodb-memory-server"
import { UserDBModel } from "../features/user/userModels"
import { appConfig } from "../common/config/config"
import { TCommentDB } from "../features/comments/comments.types"
import { ApiRequestsDBModel } from "../features/utils/api-requests/api-requests.types"
import { SessionsDBModel } from "../features/sessions/sessions.types"

export let blogsCollection: Collection<BlogDBModel>
export let postsCollection: Collection<PostDBModel>
export let usersCollection: Collection<UserDBModel>
export let commentsCollection: Collection<TCommentDB>
export let apiRequestsCollection: Collection<ApiRequestsDBModel>
export let sessionsCollection: Collection<SessionsDBModel>

function initCollections(db: Db) {
    blogsCollection = db.collection<BlogDBModel>("blogs")
    postsCollection = db.collection<PostDBModel>("posts")
    usersCollection = db.collection<UserDBModel>("users")
    commentsCollection = db.collection<TCommentDB>("comments")
    apiRequestsCollection = db.collection<ApiRequestsDBModel>("apiRequests")
    sessionsCollection = db.collection<SessionsDBModel>("sessions")
}

export async function runDb() {
    const mongoUrl = appConfig.mongoUrl
    const dbName = appConfig.dbName

    const client = new MongoClient(mongoUrl)
    const db = client.db(dbName)

    initCollections(db)

    try {
        await client.connect()
        await db.command({ ping: 1 })
        console.log("Successfully connected to MongoDB")
        return true
    } catch (error) {
        console.error(error)
        await client.close()
        return false
    }
}

export async function runTestDb() {
    const server = await MongoMemoryServer.create()
    const url = server.getUri()
    const client = await MongoClient.connect(url)
    const db = client.db()

    initCollections(db)

    return {
        server,
        client,
    }
}