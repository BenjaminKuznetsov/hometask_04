export type SessionsDBModel = {
    user_id: string
    device_id: string
    user_agent?: string
    ip?: string
    iat: Date
    exp: Date
}

export type SessionUpdateDTO = {
    user_id: string
    device_id: string
    iat: Date
    exp: Date
}

export type DeviceViewModel = {
    ip: string,
    title: string
    lastActiveDate: string
    deviceId: string
}