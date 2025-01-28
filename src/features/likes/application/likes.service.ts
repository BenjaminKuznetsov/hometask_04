import { inject, injectable } from "inversify"
import { LikeDto } from "../domain/dto"
import { LikesRepo } from "../infra/likes.repo"
import { ResultType } from "../../../common/result/result.type"
import { resultHelpers } from "../../../common/result/helpers"
import { LikeModel, LikeStatus } from "../domain/likes.model"

@injectable()
export class LikesService {
    constructor(
        @inject(LikesRepo) private likesRepo: LikesRepo,
    ) {}

    async createOrUpdateLike(dto: LikeDto): Promise<ResultType<{ prevStatus: LikeStatus | null }>> {
        const likeDocument = await this.likesRepo.getLikeByMetadata(dto.parentId, dto.authorId)

        if (likeDocument) {
            const prevStatus = likeDocument.status
            likeDocument.updateLikeStatus(dto.status)
            await this.likesRepo.save(likeDocument)
            return resultHelpers.success({ prevStatus })
        }

        const newLike = LikeModel.createLike(dto)
        await this.likesRepo.save(newLike)
        return resultHelpers.success({ prevStatus: null })
    }
}