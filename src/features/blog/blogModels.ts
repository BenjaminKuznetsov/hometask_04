export type BlogDBModel = {
    name: string
    description: string
    websiteUrl: string
    createdAt: string
    isMembership: boolean
}

export type BlogViewModel = {
    id: string
    name: string
    description: string
    websiteUrl: string
    createdAt: string
    isMembership: boolean
}

export const exampleBlogDocument = {
    id: "1",
    name: "string",
    description: "string",
    websiteUrl: "string",
    createdAt: "string",
    isMembership: false,
}

export type BlogSearchParams = {
    searchNameTerm?: string | null
    sortBy: keyof BlogViewModel
    sortDirection: "asc" | "desc"
    pageNumber: number
    pageSize: number
}

export type BlogInputModel = {
    name: string
    description: string
    websiteUrl: string
}