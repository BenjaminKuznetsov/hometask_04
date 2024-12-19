import { HydratedDocument, model, Schema } from "mongoose"

export type Session = {
    user_id: string
    device_id: string
    user_agent?: string
    ip?: string
    iat: number
    exp: number
}

export type SessionDocument = HydratedDocument<Session>

export const sessionSchema = new Schema<Session>({
    user_id: { type: String, require: true },
    device_id: { type: String, require: true },
    user_agent: { type: String },
    ip: { type: String },
    iat: { type: Number, require: true },
    exp: { type: Number, require: true },
})

export const SessionModel = model<Session>("sessions", sessionSchema)

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