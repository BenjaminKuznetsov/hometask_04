import { Session, SessionDocument, SessionModel, SessionUpdateDTO } from "../domain/sessions.model"
import { RefreshTokenPayload } from "../../../common/types/types"

export const sessionsRepo = {
    async createSession(session: Session): Promise<string> {
        const createdSession = await SessionModel.create(session)
        return createdSession._id.toString()
    },

    async doesSessionExists(data: RefreshTokenPayload): Promise<boolean> {
        const result = await SessionModel.findOne({
            user_id: data.userId,
            device_id: data.deviceId,
            iat: data.iat,
            exp: data.exp,
        })
        return !!result
    },

    async updateSession(session: SessionUpdateDTO): Promise<boolean> {
        const result = await SessionModel.updateOne({
            user_id: session.user_id,
            device_id: session.device_id,
        }, {
            $set: { iat: session.iat, exp: session.exp },
        })
        return !!result.modifiedCount
    },

    async deleteSession(userId: string, deviceId: string): Promise<boolean> {
        const result = await SessionModel.deleteOne({ user_id: userId, device_id: deviceId })
        return !!result.deletedCount
    },

    async deleteAllOtherUserSessions(userId: string, deviceId: string): Promise<boolean> {
        const result = await SessionModel.deleteMany({ user_id: userId, device_id: { $ne: deviceId } })
        return !!result.deletedCount
    },
    async getSessionsByUserId(userId: string): Promise<SessionDocument[]> {
        return SessionModel.find({ user_id: userId }).sort({ iat: -1 })
    },
    async getSessionsByDeviceId(deviceId: string): Promise<SessionDocument[]> {
        return SessionModel.find({ device_id: deviceId })
    },
    async deleteSessionByUserIdAndDeviceId(userId: string, deviceId: string): Promise<number> {
        const result = await SessionModel.deleteOne({ user_id: userId, device_id: deviceId })
        return result.deletedCount
    },
}