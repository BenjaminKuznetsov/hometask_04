import { LikeStatus } from "../../likes/domain/likes.model"

export type TCommentInput = {
    content: string
}
export type TCommentViewModel = {
    id: string
    content: string
    commentatorInfo: {
        userId: string
        userLogin: string
    }
    createdAt: string
    likesInfo: LikesInfo
}

export type LikesInfo = {
    likesCount: number,
    dislikesCount: number,
    myStatus: LikeStatus
}

export const exampleCommentDocument = {
    id: "1",
    content: "string",
    commentatorInfo: {
        userId: "string",
        userLogin: "string",
    },
    createdAt: "string",
    likesInfo: {
        likesCount: 0,
        dislikesCount: 0,
        myStatus: LikeStatus.None,
    },
}
