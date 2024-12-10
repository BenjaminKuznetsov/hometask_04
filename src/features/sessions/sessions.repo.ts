import { SessionsDBModel, SessionUpdateDTO } from "./sessions.types"
import { sessionsCollection } from "../../db/mongo"
import { WithId } from "mongodb"
import { RefreshTokenPayload } from "../../common/types/types"

export const sessionsRepo = {
    async createSession(session: SessionsDBModel): Promise<string> {
        const result = await sessionsCollection.insertOne(session)
        return result.insertedId.toString()
    },

    async doesSessionExists(data: RefreshTokenPayload): Promise<boolean> {
        const result = await sessionsCollection.findOne({
            user_id: data.userId,
            device_id: data.deviceId,
            iat: data.iat,
            exp: data.exp,
        })
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

    async deleteAllOtherUserSessions(userId: string, deviceId: string): Promise<boolean> {
        const result = await sessionsCollection.deleteMany({ user_id: userId, device_id: { $ne: deviceId } })
        return !!result.deletedCount
    },
    async getSessionsByUserId(userId: string): Promise<WithId<SessionsDBModel>[]> {
        return await sessionsCollection.find({ user_id: userId }).sort({ iat: -1 }).toArray()
    },
    async getSessionsByDeviceId(deviceId: string): Promise<WithId<SessionsDBModel>[]> {
        return await sessionsCollection.find({ device_id: deviceId }).toArray()
    },
    async deleteSessionByUserIdAndDeviceId(userId: string, deviceId: string): Promise<number> {
        const result = await sessionsCollection.deleteOne({ user_id: userId, device_id: deviceId })
        return result.deletedCount
    },
}