import { DB_Collections } from "../../src/types"
import { db } from "../../src/db/memory"

export const clearDb = async (collections: DB_Collections[] = [ "blogs", "posts" ]) => {
    for (const collection of collections) {
        db[collection] = []
    }
}
