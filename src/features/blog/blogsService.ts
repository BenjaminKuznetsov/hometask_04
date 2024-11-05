import { BlogDBModel, BlogInputModel, BlogSearchParams, BlogViewModel } from "./blogModels"
import { blogsRepository } from "./blogsRepository"
import { Paginator } from "../../types"
import { postsService } from "../posts/postsService"
import { PostSearchParams, PostViewModel } from "../posts/postModels"

export const blogsService = {
    getBlogs: async (queryParams: BlogSearchParams): Promise<Paginator<BlogViewModel>> => {

        const foundBlogs = await blogsRepository.getBlogs(queryParams)
        const totalCount = await blogsRepository.getBlogsCount()

        return {
            pagesCount: Math.ceil(totalCount / queryParams.pageSize),
            page: queryParams.pageNumber,
            pageSize: queryParams.pageSize,
            totalCount,
            items: foundBlogs,
        }
    },
    getBlogById: async (id: string): Promise<BlogViewModel | null> => {
        return await blogsRepository.getBlogById(id)
    },
    getPostsByBlogId: async (searchParams: PostSearchParams): Promise<Paginator<PostViewModel>> => {
        return await postsService.getPosts(searchParams)
    },
    createBlog: async (input: BlogInputModel): Promise<BlogViewModel> => {
        const newBlog: BlogDBModel = {
            ...input,
            createdAt: new Date().toISOString(),
            isMembership: false,
        }
        return await blogsRepository.createBlog(newBlog)
    },
    updateBlog: async (id: string, input: BlogInputModel): Promise<boolean> => {
        return await blogsRepository.updateBlog(id, input)
    },
    deleteBlog: async (id: string): Promise<boolean> => {
        return await blogsRepository.deleteBlog(id)
    },
}
