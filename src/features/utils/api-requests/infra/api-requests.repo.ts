import { ApiRequests, ApiRequestsModel } from "../domain/api-requests.model"

export const apiRequestsRepo = {
    async saveRequest(ip: string, url: string): Promise<void> {
        const request: ApiRequests = { ip, url, date: new Date() }
        await ApiRequestsModel.create(request)
    },

    async getRequestsCountAfter(ip: string, url: string, date: Date): Promise<number> {
        return await ApiRequestsModel.countDocuments({ ip, url, date: { $gt: date } })
    },
}