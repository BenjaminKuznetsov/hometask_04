import { injectable } from "inversify"
import { LikeDocument, LikeModel, LikeStatus } from "../domain/likes.model"

@injectable()
export class LikesRepo {
    constructor() {}

    async save(like: LikeDocument) {
        await like.save()
    }

    async getLikeByMetadata(parentId: string, authorId: string): Promise<LikeDocument | null> {
        return LikeModel.findOne({ parentId, authorId })
    }

    async getCountByParentId(parentId: string, status: LikeStatus): Promise<number> {
        return LikeModel.countDocuments({ parentId, status })
    }
}