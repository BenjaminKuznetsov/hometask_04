export class CreateCommentDto {
    constructor(
        public content: string,
        public commentatorId: string,
        public postId: string,
    ) { }
}