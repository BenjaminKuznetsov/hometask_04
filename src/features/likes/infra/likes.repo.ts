import { injectable } from "inversify"
import { LikeDocument, LikeModel, LikeStatus } from "../domain/likes.model"
import { UserDocument, UserModel } from "../../user/domain/userModels"

type PopulatedLikeDocument = Omit<LikeDocument, "authorId"> & { authorId: UserDocument }

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

    async getLastThreeLikesByPostId(postId: string): Promise<PopulatedLikeDocument[]> {
        return (LikeModel.find({
                parentId: postId,
                status: LikeStatus.Like,
            }).sort({ createdAt: -1 }).limit(3).populate({ path: "authorId", model: UserModel })
        ) as Promise<PopulatedLikeDocument[]>
    }
}

