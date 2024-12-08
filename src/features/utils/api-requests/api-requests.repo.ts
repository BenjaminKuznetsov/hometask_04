import { ApiRequestsDBModel } from "./api-requests.types"
import { apiRequestsCollection } from "../../../db/mongo"

export const apiRequestsRepo = {
    async saveRequest(ip: string, url: string): Promise<any> {
        const request: ApiRequestsDBModel = { ip, url, date: new Date() }
        return apiRequestsCollection.insertOne(request)
    },

    async getRequestsCountAfter(ip: string, url: string, date: Date): Promise<number> {
        return await apiRequestsCollection.countDocuments({ ip, url, date: { $gt: date } })
    },
}