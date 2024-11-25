export type TCommentInput = {
    content: string
}

export type TCommentDB = {
    content: string
    commentatorId: string
    postId: string
    createdAt: string
}

export type TCommentDBWithId = TCommentDB & { id: string }

export type TCommentViewModel = {
    id: string
    content: string
    commentatorInfo: {
        userId: string
        userLogin: string
    }
    createdAt: string
}

export const exampleCommentDocument = {
    id: "1",
    content: "string",
    commentatorInfo: {
        userId: "string",
        userLogin: "string",
    },
    createdAt: "string",
}