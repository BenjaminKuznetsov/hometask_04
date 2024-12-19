import { model, Schema } from "mongoose"

export type ApiRequests = {
    ip: string
    url: string
    date: Date
}

export const apiRequestsSchema = new Schema<ApiRequests>({
    ip: { type: String, require: true },
    url: { type: String, require: true },
    date: { type: Date, require: true },
})

export const ApiRequestsModel = model<ApiRequests>("apiRequests", apiRequestsSchema)