import { sessionsRepo } from "./sessions.repo"
import { DeviceViewModel } from "./sessions.types"
import useragent from "express-useragent"
import { ResultType } from "../../common/result/result.type"
import { resultHelpers } from "../../common/result/helpers"
import { jwtService } from "../../common/adapters/jwt.service"
import { RefreshTokenPayload } from "../../common/types/types"

export const sessionsService = {

    async _checkRefreshToken(refreshToken: string): Promise<ResultType<RefreshTokenPayload | null>> {
        const jwtResult = await jwtService.verifyToken(refreshToken)
        if (!resultHelpers.isSuccess(jwtResult)) {
            return resultHelpers.unauthorized()
        }

        const doesSessionExists = await sessionsRepo.doesSessionExists(jwtResult.data as RefreshTokenPayload)
        if (!doesSessionExists) {
            return resultHelpers.unauthorized()
        }

        return resultHelpers.success(jwtResult.data as RefreshTokenPayload)
    },

    async getUserDevices(refreshToken: string): Promise<ResultType<DeviceViewModel[] | null>> {
        const result = await this._checkRefreshToken(refreshToken)
        if (!resultHelpers.isSuccess(result)) {
            return resultHelpers.unauthorized()
        }

        const userId = result.data.userId
        const devices = await sessionsRepo.getSessionsByUserId(userId)

        const mappedDevices: DeviceViewModel[] = []

        for (const device of devices) {
            const parsedUserAgent = useragent.parse(device.user_agent || "")

            mappedDevices.push({
                ip: device.ip || "unknown",
                title: `${parsedUserAgent.browser} ${parsedUserAgent.version}`,
                lastActiveDate: new Date(device.iat).toISOString(),
                deviceId: device.device_id,
            })
        }

        return resultHelpers.success(mappedDevices)
    },
    async terminateAllOtherUserSessions(refreshToken: string): Promise<ResultType<true | null>> {
        const result = await this._checkRefreshToken(refreshToken)
        if (!resultHelpers.isSuccess(result)) {
            return resultHelpers.unauthorized()
        }
        const userId = result.data.userId
        const deviceId = result.data.deviceId
        await sessionsRepo.deleteAllOtherUserSessions(userId, deviceId)
        return resultHelpers.success(true)
    },
    async terminateOneSession(refreshToken: string, deviceId: string): Promise<ResultType<true | null>> {
        const result = await this._checkRefreshToken(refreshToken)
        if (!resultHelpers.isSuccess(result)) {
            return resultHelpers.unauthorized()
        }

        const userId = result.data.userId

        const sessions = await sessionsRepo.getSessionsByDeviceId(deviceId)
        if (sessions.length === 0) {
            return resultHelpers.notFound()
        }

        const userSessions = sessions.filter(session => session.user_id === userId)
        if (userSessions.length === 0) {
            return resultHelpers.forbidden()
        }

        await sessionsRepo.deleteSessionByUserIdAndDeviceId(userId, deviceId)

        return resultHelpers.success(true)
    },
}