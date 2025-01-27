import { Blog, BlogDocument, BlogInputModel } from "../domain/blog.model"
import { BlogsRepository } from "../infra/blogs.repo"
import { inject, injectable } from "inversify"

@injectable()
export class BlogsService {
    constructor(@inject(BlogsRepository) private blogsRepository: BlogsRepository) {
    }

    async getBlogById(id: string): Promise<BlogDocument | null> {
        return this.blogsRepository.getBlogById(id)
    }

    async createBlog(input: BlogInputModel): Promise<string> {
        const newBlog: Blog = {
            ...input,
            isMembership: false,
        }
        return await this.blogsRepository.createBlog(newBlog)
    }

    async updateBlog(id: string, input: BlogInputModel): Promise<boolean> {
        return await this.blogsRepository.updateBlog(id, input)
    }

    async deleteBlog(id: string): Promise<boolean> {
        return await this.blogsRepository.deleteBlog(id)
    }
}

