import { BlogDBModel, BlogInputModel, BlogSearchParams, BlogViewModel } from "./blogModels"
import { blogsRepository } from "./blogsRepository"

export const blogsService = {
    getAllBlogs: async (queryParams: BlogSearchParams): Promise<BlogViewModel[]> => {
        return await blogsRepository.getAllBlogs(queryParams)
    },
    getBlogById: async (id: string): Promise<BlogViewModel | null> => {
        return await blogsRepository.getBlogById(id)
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
