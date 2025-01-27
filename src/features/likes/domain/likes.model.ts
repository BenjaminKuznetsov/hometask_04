import { HydratedDocument, Model, model, Schema } from "mongoose"
import { Timestamps } from "../../../common/types/types"
import { CreateLikeDto } from "./dto"

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

    static createLike(dto: CreateLikeDto): LikeDocument {
        return new LikeModel(dto) as LikeDocument
    }
}

likesSchema.loadClass(LikeEntity)

const LikeModel = model<Like, LikeModel>("likes", likesSchema)
