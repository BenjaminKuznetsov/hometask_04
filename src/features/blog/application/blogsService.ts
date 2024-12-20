import { Blog, BlogInputModel } from "../domain/blog.model"
import { blogsRepository } from "../infra/blogsRepository"

export const blogsService = {
    createBlog: async (input: BlogInputModel): Promise<string> => {
        const newBlog: Blog = {
            ...input,
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
