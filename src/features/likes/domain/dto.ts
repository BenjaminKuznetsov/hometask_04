import { LikeStatus } from "./likes.model"

export class LikeDto {
    constructor(
        public status: LikeStatus,
        public authorId: string,
        public parentId: string,
    ) {}
}