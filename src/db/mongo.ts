import { MongoClient } from "mongodb"
import { MongoMemoryServer } from "mongodb-memory-server"
import { appConfig } from "../common/config/config"
import mongoose from "mongoose"

export const db = {
    client: {} as any,

    async run(mode: "dev" | "test" = "dev") {
        const dbName = mode === "dev" ? appConfig.dbName : appConfig.testDbName
        try {
            this.client = await mongoose.connect(`${appConfig.mongoUrl}/${dbName}`)
            console.log(`Connected successfully to "${this.client.connection.db.namespace}" database`)
            return true
        } catch (e: unknown) {
            console.error("Can't connect to mongo server", e)
            await mongoose.disconnect()
            return false
        }
    },

    async stop() {
        await mongoose.disconnect()
        console.log("Connection successful closed")
    },

    async drop() {
        try {
            await this.client.connection.db.dropDatabase()
        } catch (e: unknown) {
            console.error("Error in drop db:", e)
            await this.stop()
        }
    },
}

export async function runTestDb() {
    const server = await MongoMemoryServer.create()
    const url = server.getUri()
    const client = await MongoClient.connect(url)

    return {
        server,
        client,
    }
}
