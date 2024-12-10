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

export const db = {
    client: {} as MongoClient,

    getDbName(): Db {
        return this.client.db(appConfig.dbName)
    },
    async run() {
        try {
            this.client = new MongoClient(appConfig.mongoUrl)
            await this.client.connect()
            await this.getDbName().command({ ping: 1 })
            this.initCollections()
            console.log("Connected successfully to mongo server")
            return true
        } catch (e: unknown) {
            console.error("Can't connect to mongo server", e)
            await this.client.close()
            return false
        }
    },

    async stop() {
        await this.client.close()
        console.log("Connection successful closed")
    },
    async drop() {
        try {
            //await this.getDbName().dropDatabase()
            const collections = await this.getDbName().listCollections().toArray()

            for (const collection of collections) {
                const collectionName = collection.name
                await this.getDbName().collection(collectionName).deleteMany({})
            }
        } catch (e: unknown) {
            console.error("Error in drop db:", e)
            await this.stop()
        }
    },
    initCollections() {
        initCollections(this.getDbName())
    },
    // getCollections() {
    //     return {
    //         usersCollection: this.getDbName().collection<User>("users"),
    //         //blogsCollection:
    //
    //         //...all collections
    //     }
    // },

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
