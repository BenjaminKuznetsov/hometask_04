import { HydratedDocument, Model, model, Schema } from "mongoose"
import { Timestamps } from "../../../common/types/types"
import { LikeStatus } from "../../likes/domain/likes.model"

export type Post = {
    title: string
    shortDescription: string
    content: string
    blogId: string
    blogName: string
    likesCount: number
    dislikesCount: number
    // createdAt: string
}

interface PostMethods {
    calculateLikesCount(status: LikeStatus, prevStatus: LikeStatus | null): void
}

type PostStatics = typeof PostEntity
type PostModel = Model<Post, object, PostMethods> & PostStatics

export type PostDocument = HydratedDocument<Post, PostMethods> & Timestamps

const postSchema = new Schema<Post>({
    title: { type: String, require: true },
    shortDescription: { type: String, require: true },
    content: { type: String, require: true },
    blogId: { type: String, require: true },
    blogName: { type: String, require: true },
    likesCount: { type: Number, default: 0 },
    dislikesCount: { type: Number, default: 0 },
}, {
    timestamps: true,
})

class PostEntity {
    private constructor(
        public title: string,
        public shortDescription: string,
        public content: string,
        public blogId: string,
        public blogName: string,
        public likesCount: number,
        public dislikesCount: number,
    ) { }

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

postSchema.loadClass(PostEntity)

export const PostModel = model<Post, PostModel>("posts", postSchema)

export type PostViewModel = {
    id: string
    title: string
    shortDescription: string
    content: string
    blogId: string
    blogName: string
    createdAt: string
    extendedLikesInfo: ExtendedLikesInfo
}

export type ExtendedLikesInfo = {
    likesCount: number
    dislikesCount: number
    myStatus: LikeStatus
    newestLikes: Array<{
        addedAt: string
        userId: string
        login: string
    }>
}

export type PostInputModel = {
    title: string
    shortDescription: string
    content: string
    blogId: string
}

export const examplePostDocument = {
    id: "1",
    title: "string",
    shortDescription: "string",
    content: "string",
    blogId: "string",
    blogName: "string",
    createdAt: "string",
    extendedLikesInfo: {
        likesCount: 0,
        dislikesCount: 0,
        myStatus: LikeStatus.None,
        newestLikes: [ {
            addedAt: "string",
            userId: "string",
            login: "string",
        } ],
    },
}

export type PostSearchParams = {
    blogId?: string
}