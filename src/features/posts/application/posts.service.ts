import { Blog } from "../../blog/domain/blog.model"
import { Post, PostInputModel } from "../domain/post.model"
import { ResultType } from "../../../common/result/result.type"
import { resultHelpers } from "../../../common/result/helpers"
import { PostsRepository } from "../infra/posts.repo"
import { BlogsRepository } from "../../blog/infra/blogs.repo"

export class PostsService {
    constructor(private postsRepository: PostsRepository, private blogsRepository: BlogsRepository) {
    }

    async createPost(input: PostInputModel): Promise<ResultType<string | null>> {
        const blog = await this.blogsRepository.getBlogById(input.blogId)

        if (!blog) {
            return resultHelpers.notFound({ message: "Blog not found", field: "blogId" })
        }

        const newPost: Post = {
            title: input.title,
            shortDescription: input.shortDescription,
            content: input.content,
            blogId: input.blogId,
            blogName: blog.name,
        }
        const createdPostId = await this.postsRepository.createPost(newPost)
        return resultHelpers.success(createdPostId)
    }

    async updatePost(id: string, input_post: PostInputModel): Promise<ResultType<true | null>> {
        const blog = await this.blogsRepository.getBlogById(input_post.blogId) as Blog

        if (!blog) {
            return resultHelpers.notFound({ message: "Blog not found", field: "blogId" })
        }

        const updatedPost: Partial<Post> = {
            title: input_post.title,
            shortDescription: input_post.shortDescription,
            content: input_post.content,
            blogId: input_post.blogId,
            blogName: blog.name,
        }

        const isUpdated = await this.postsRepository.updatePost(id, updatedPost)

        if (!isUpdated) {
            return resultHelpers.notFound()
        }

        return resultHelpers.success(true)
    }

    async deletePost(id: string): Promise<boolean> {
        return await this.postsRepository.deletePost(id)
    }
}
