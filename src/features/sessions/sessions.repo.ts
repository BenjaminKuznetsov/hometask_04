import { SessionsDBModel, SessionUpdateDTO } from "./sessions.types"
import { sessionsCollection } from "../../db/mongo"
import { WithId } from "mongodb"

export const sessionsRepo = {
    async createSession(session: SessionsDBModel): Promise<string> {
        const result = await sessionsCollection.insertOne(session)
        return result.insertedId.toString()
    },

    async checkSessionDoesExists(userId: string, deviceId: string): Promise<boolean> {
        const result = await sessionsCollection.findOne({ user_id: userId, device_id: deviceId })
        return !!result
    },

    async updateSession(session: SessionUpdateDTO): Promise<boolean> {
        const result = await sessionsCollection.updateOne({
            user_id: session.user_id,
            device_id: session.device_id,
        }, {
            $set: { iat: session.iat, exp: session.exp },
        })
        return !!result.modifiedCount
    },

    async deleteSession(userId: string, deviceId: string): Promise<boolean> {
        const result = await sessionsCollection.deleteOne({ user_id: userId, device_id: deviceId })
        return !!result.deletedCount
    },

    async deleteAllSessions(userId: string): Promise<boolean> {
        const result = await sessionsCollection.deleteMany({ user_id: userId })
        return !!result.deletedCount
    },
    async getDevicesByUserId(userId: string): Promise<WithId<SessionsDBModel>[]> {
        return await sessionsCollection.find({ user_id: userId }).toArray()
    },
}