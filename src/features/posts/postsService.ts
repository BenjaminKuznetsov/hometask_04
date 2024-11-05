import { BlogDBModel } from "../blog/blogModels"
import { blogsRepository } from "../blog/blogsRepository"
import { PostDBModel, PostInputModel, PostViewModel } from "./postModels"
import { postsRepository } from "./postsRepository"

export const postsService = {
    getAllPosts: async (): Promise<PostViewModel[]> => {
        return await postsRepository.getAllPosts()
    },
    getPostById: async (id: string): Promise<PostViewModel | null> => {
        return await postsRepository.getPostById(id)
    },
    createPost: async (input: PostInputModel): Promise<PostViewModel> => {
        // TODO: уточнить - тут нужно обращаться к сервису или к репозиторию?
        const blog = await blogsRepository.getBlogById(input.blogId) as BlogDBModel
        const newPost: PostDBModel = {
            title: input.title,
            shortDescription: input.shortDescription,
            content: input.content,
            blogId: input.blogId,
            blogName: blog.name,
            createdAt: new Date().toISOString(),
        }
        return await postsRepository.createPost(newPost)
    },
    updatePost: async (id: string, input_post: PostInputModel): Promise<boolean> => {
        // TODO: уточнить - тут нужно обращаться к сервису или к репозиторию?
        const blog = await blogsRepository.getBlogById(input_post.blogId) as BlogDBModel
        const updatedPost: Partial<PostDBModel> = {
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
