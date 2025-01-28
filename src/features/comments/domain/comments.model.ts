import { HydratedDocument, Model, model, Schema } from "mongoose"
import { Timestamps } from "../../../common/types/types"
import { CreateCommentDto } from "../application/dto"
import { LikeStatus } from "../../likes/domain/likes.model"

export type Comment = {
    content: string
    commentatorId: string
    postId: string
    likesCount: number
    dislikesCount: number
}

interface CommentsMethods {
    calculateLikesCount(status: LikeStatus, prevStatus: LikeStatus | null): void
}

type CommentStatics = typeof CommentEntity

type CommentModel = Model<Comment, object, CommentsMethods> & CommentStatics

export type CommentDocument = HydratedDocument<Comment, CommentsMethods> & Timestamps & { id: string }

const commentSchema = new Schema<Comment, CommentModel, CommentsMethods>({
    content: { type: String, require: true },
    commentatorId: { type: String, require: true },
    postId: { type: String, require: true },
    likesCount: { type: Number, default: 0 },
    dislikesCount: { type: Number, default: 0 },
}, {
    timestamps: true,
})

class CommentEntity {
    private constructor(
        public content: string,
        public commentatorId: string,
        public postId: string,
        public likesCount: number,
        public dislikesCount: number,
    ) { }

    static createComment(dto: CreateCommentDto): CommentDocument {
        return new CommentModel(dto) as CommentDocument
    }

    calculateLikesCount(newStatus: LikeStatus, prevStatus: LikeStatus | null) {
        if (prevStatus === newStatus) {
            return
        }

        if (prevStatus === LikeStatus.None || !prevStatus) {
            if (newStatus === LikeStatus.Like) {
                this.likesCount += 1
            }
            if (newStatus === LikeStatus.Dislike) {
                this.dislikesCount += 1
            }
        }

        if (prevStatus === LikeStatus.Like) {
            if (newStatus === LikeStatus.None) {
                this.likesCount -= 1
            }
            if (newStatus === LikeStatus.Dislike) {
                this.likesCount -= 1
                this.dislikesCount += 1
            }
        }
        if (prevStatus === LikeStatus.Dislike) {
            if (newStatus === LikeStatus.None) {
                this.dislikesCount -= 1
            }
            if (newStatus === LikeStatus.Like) {
                this.dislikesCount -= 1
                this.likesCount += 1
            }
        }
    }

}

commentSchema.loadClass(CommentEntity)

export const CommentModel = model<Comment, CommentModel>("comments", commentSchema)