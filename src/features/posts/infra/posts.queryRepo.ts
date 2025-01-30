import { ExtendedLikesInfo, PostDocument, PostModel, PostSearchParams, PostViewModel } from "../domain/post.model"
import { Paginator, PagingParams } from "../../../common/types/types"
import { inject, injectable } from "inversify"
import { LikeStatus } from "../../likes/domain/likes.model"
import { LikesRepo } from "../../likes/infra/likes.repo"

@injectable()
export class PostsQueryRepo {
    constructor(
        @inject(LikesRepo) private likesRepo: LikesRepo,
    ) {}

    async getPostsWithPagingAndFilter(searchParams: PostSearchParams, pagingParams: PagingParams<PostViewModel>, userId: string | null): Promise<Paginator<PostViewModel>> {
        const filter: Record<string, unknown> = {}
        if (searchParams.blogId) {
            filter.blogId = searchParams.blogId
        }

        const foundPosts: PostDocument[] = await PostModel
            .find(filter, null, {
                sort: { [pagingParams.sortBy]: pagingParams.sortDirection },
                skip: (pagingParams.pageNumber - 1) * pagingParams.pageSize,
                limit: pagingParams.pageSize,
            })

        const totalCount = await PostModel.countDocuments(filter)

        const mappedPosts = []
        for await (const post of foundPosts) {
            const mappedPost = await this._postMapperToView(post, userId)
            mappedPosts.push(mappedPost)
        }

        return {
            pagesCount: Math.ceil((totalCount / pagingParams.pageSize) || 1),
            page: pagingParams.pageNumber,
            pageSize: pagingParams.pageSize,
            totalCount,
            items: mappedPosts,
        }
    }

    async getPostById(id: string, userId: string | null): Promise<PostViewModel | null> {
        const foundPost: PostDocument | null = await PostModel.findById(id)
        if (!foundPost) {
            return null
        }
        return this._postMapperToView(foundPost, userId)
    }

    private async _getLikesInfo(postId: string, userId: string | null): Promise<ExtendedLikesInfo> {
        const likesCount = await this.likesRepo.getCountByParentId(postId, LikeStatus.Like)
        const dislikesCount = await this.likesRepo.getCountByParentId(postId, LikeStatus.Dislike)
        let userStatus: LikeStatus

        if (!userId) {
            userStatus = LikeStatus.None
        } else {
            const like = await this.likesRepo.getLikeByMetadata(postId, userId)
            if (!like) {
                userStatus = LikeStatus.None
            } else {
                userStatus = like.status
            }
        }

        const newestLikes = await this.likesRepo.getLastThreeLikesByPostId(postId)
        const mappedNewestLikes = newestLikes.map(like => ({
            addedAt: like.createdAt.toISOString(),
            userId: like.authorId._id.toString(),
            login: like.authorId.login,
        }))

        return {
            likesCount,
            dislikesCount,
            myStatus: userStatus,
            newestLikes: mappedNewestLikes,
        }
    }

    private async _postMapperToView(post: PostDocument, userId: string | null): Promise<PostViewModel> {
        const extendedLikesInfo = await this._getLikesInfo(post._id.toString(), userId)
        return {
            id: post._id.toString(),
            title: post.title,
            shortDescription: post.shortDescription,
            content: post.content,
            blogId: post.blogId.toString(),
            blogName: post.blogName,
            createdAt: post.createdAt.toISOString(),
            extendedLikesInfo,
        }
    }
}
