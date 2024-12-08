import { sessionsRepo } from "./sessions.repo"
import { DeviceViewModel } from "./sessions.types"
import useragent from "express-useragent"

export const sessionsService = {

    async getDevices(userId: string): Promise<DeviceViewModel[]> {
        const devices = await sessionsRepo.getDevicesByUserId(userId)

        const mappedDevices: DeviceViewModel[] = []

        for (const device of devices) {
            const parsedUserAgent = useragent.parse(device.user_agent || "")

            mappedDevices.push({
                ip: device.ip || "unknown",
                title: `${parsedUserAgent.browser} ${parsedUserAgent.version}`,
                lastActiveDate: device.iat.toISOString(),
                deviceId: device.device_id,
            })
        }

        return mappedDevices
    },
}