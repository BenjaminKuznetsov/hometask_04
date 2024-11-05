import { BlogDBModel } from "../blog/blogModels"
import { blogsRepository } from "../blog/blogsRepository"
import { PostDBModel, PostInputModel, PostSearchParams, PostViewModel } from "./postModels"
import { postsRepository } from "./postsRepository"
import { Paginator } from "../../types"

export const postsService = {
    getPosts: async (queryParams: PostSearchParams): Promise<Paginator<PostViewModel>> => {
        const foundPosts = await postsRepository.getPosts(queryParams)
        const totalCount = await postsRepository.getPostsCount()

        return {
            pagesCount: Math.ceil(totalCount / queryParams.pageSize),
            page: queryParams.pageNumber,
            pageSize: queryParams.pageSize,
            totalCount,
            items: foundPosts,
        }
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
