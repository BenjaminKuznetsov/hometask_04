export type SessionsDBModel = {
    user_id: string
    device_id: string
    user_agent?: string
    ip?: string
    iat: number
    exp: number
}

export type SessionUpdateDTO = {
    user_id: string
    device_id: string
    iat: number
    exp: number
}

export type DeviceViewModel = {
    ip: string,
    title: string
    lastActiveDate: string
    deviceId: string
}