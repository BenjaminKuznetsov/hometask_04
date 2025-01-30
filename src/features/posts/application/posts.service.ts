import { Blog } from "../../blog/domain/blog.model"
import { Post, PostInputModel } from "../domain/post.model"
import { ResultType } from "../../../common/result/result.type"
import { resultHelpers } from "../../../common/result/helpers"
import { PostsRepository } from "../infra/posts.repo"
import { BlogsRepository } from "../../blog/infra/blogs.repo"
import { inject, injectable } from "inversify"
import { LikeStatus } from "../../likes/domain/likes.model"
import { LikeDto } from "../../likes/domain/dto"
import { LikesService } from "../../likes/application/likes.service"

@injectable()
export class PostsService {
    constructor(
        @inject(PostsRepository) private postsRepository: PostsRepository,
        @inject(BlogsRepository) private blogsRepository: BlogsRepository,
        @inject(LikesService) private likesService: LikesService,
    ) {
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
            likesCount: 0,
            dislikesCount: 0,
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

    async handleLike(postId: string, userId: string, likeStatus: LikeStatus): Promise<ResultType<true | null>> {
        const post = await this.postsRepository.getPostById(postId)

        if (!post) {
            return resultHelpers.notFound()
        }

        const likeDto = new LikeDto(likeStatus, userId, postId)
        const result = await this.likesService.createOrUpdateLike(likeDto)

        post.calculateLikesCount(likeStatus, result.data.prevStatus)
        await post.save()

        return resultHelpers.success(true)
    }
}
