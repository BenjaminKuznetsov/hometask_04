import { Blog } from "../../blog/domain/blog.model"
import { blogsRepository } from "../../blog/infra/blogsRepository"
import { Post, PostInputModel } from "../domain/post.model"
import { postsRepository } from "../infra/postsRepository"

export class BlogNotFoundError extends Error {
    constructor(message: string) {
        super(message)
    }
}

export const postsService = {
    createPost: async (input: PostInputModel): Promise<string> => {
        const blog = await blogsRepository.getBlogById(input.blogId)

        if (!blog) {
            throw new BlogNotFoundError("Blog with such id not found")
        }

        const newPost: Post = {
            title: input.title,
            shortDescription: input.shortDescription,
            content: input.content,
            blogId: input.blogId,
            blogName: blog.name,
        }
        return await postsRepository.createPost(newPost)
    },
    updatePost: async (id: string, input_post: PostInputModel): Promise<boolean> => {
        // TODO: уточнить - тут нужно обращаться к сервису или к репозиторию?
        const blog = await blogsRepository.getBlogById(input_post.blogId) as Blog

        if (!blog) {
            throw new BlogNotFoundError("Blog with such id not found")
        }

        const updatedPost: Partial<Post> = {
            title: input_post.title,
            shortDescription: input_post.shortDescription,
            content: input_post.content,
            blogId: input_post.blogId,
            blogName: blog.name,
        }
        return await postsRepository.updatePost(id, updatedPost)
    },
    deletePost: async (id: string): Promise<boolean> => {
        return await postsRepository.deletePost(id)
    },
}
