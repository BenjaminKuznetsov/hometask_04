import { sessionsRepo } from "../infra/sessions.repo"
import { DeviceViewModel } from "../domain/sessions.model"
import useragent from "express-useragent"
import { ResultType } from "../../../common/result/result.type"
import { resultHelpers } from "../../../common/result/helpers"

export const sessionsService = {

    async getUserDevices(userId: string): Promise<ResultType<DeviceViewModel[] | null>> {

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
    async terminateAllOtherUserSessions(userId: string, deviceId: string): Promise<ResultType<true | null>> {
        await sessionsRepo.deleteAllOtherUserSessions(userId, deviceId)
        return resultHelpers.success(true)
    },
    async terminateOneSession(userId: string, deviceId: string): Promise<ResultType<true | null>> {

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