import { invalidTokensCollection } from "../../db/mongo"

export const authRepo = {
    async checkIsTokenInvalid(token: string): Promise<boolean> {
        const tokenData = await invalidTokensCollection.findOne({ token })
        return !!tokenData
    },
    async addInvalidToken(token: string) {
        await invalidTokensCollection.insertOne({ token })
    },
}