import { apiRequestsRepo } from "../infra/api-requests.repo"
import { ResultType } from "../../../../common/result/result.type"
import { subSeconds } from "date-fns"
import { appConfig } from "../../../../common/config/config"
import { resultHelpers } from "../../../../common/result/helpers"

export const apiRequestsService = {
    async saveRequest(ip: string, url: string): Promise<void> {
        await apiRequestsRepo.saveRequest(ip, url)
    },

    async checkTooManyRequests(ip: string, url: string): Promise<ResultType<true | null>> {
        const tooManyRequestsParams = appConfig.tooManyRequestsParams
        const date = subSeconds(new Date(), tooManyRequestsParams.time)
        const count = await apiRequestsRepo.getRequestsCountAfter(ip, url, date)
        if (count >= tooManyRequestsParams.count) {
            return resultHelpers.tooManyRequests()
        }
        return resultHelpers.success(true)
    },
}