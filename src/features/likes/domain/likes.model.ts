import { HydratedDocument, Model, model, Schema } from "mongoose"
import { Timestamps } from "../../../common/types/types"
import { LikeDto } from "./dto"

export enum LikeStatus {
    Like = "Like",
    Dislike = "Dislike",
    None = "None",
}

type Like = {
    status: LikeStatus,
    authorId: string,
    parentId: string
}

interface LikeMethods {
    updateLikeStatus(newStatus: LikeStatus): void
}

type LikeStatics = typeof LikeEntity

type LikeModel = Model<Like, object, LikeMethods> & LikeStatics

export type LikeDocument = HydratedDocument<Like, LikeMethods> & Timestamps & { id: string }

const likesSchema = new Schema<Like>({
    status: { type: String, enum: LikeStatus, required: true },
    authorId: { type: String, required: true },
    parentId: { type: String, required: true }, // commentId, postId, etc..
}, {
    timestamps: true,
})

class LikeEntity {
    private constructor(
        public status: LikeStatus,
        public authorId: string,
        public parentId: string,
    ) { }

    static createLike(dto: LikeDto): LikeDocument {
        return new LikeModel(dto) as LikeDocument
    }

    updateLikeStatus(newStatus: LikeStatus): void {
        this.status = newStatus
    }
}

likesSchema.loadClass(LikeEntity)

export const LikeModel = model<Like, LikeModel>("likes", likesSchema)
