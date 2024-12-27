import { LikeStatus } from "./likes.model"

export class CreateLikeDto {
    constructor(
        public status: LikeStatus,
        public authorId: string,
        public parentId: string,
    ) {}
}