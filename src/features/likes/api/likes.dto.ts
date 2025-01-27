import { LikeStatus } from "../domain/likes.model"

export class LikeInputDTO {
    constructor(
        public likeStatus: LikeStatus,
    ) {
        console.log("LikeInputDTO constructor")
        if (
            likeStatus !== LikeStatus.Like &&
            likeStatus !== LikeStatus.Dislike &&
            likeStatus !== LikeStatus.None
        ) {
            throw new Error("Invalid like status")
        }
        this.likeStatus = likeStatus
    }
}