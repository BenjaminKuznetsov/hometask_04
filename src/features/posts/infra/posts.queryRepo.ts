import { PostDocument, PostModel, PostSearchParams, PostViewModel } from "../domain/post.model"
import { Paginator, PagingParams } from "../../../common/types/types"
import { injectable } from "inversify"

@injectable()
export class PostsQueryRepo {
    async getPostsWithPagingAndFilter(searchParams: PostSearchParams, pagingParams: PagingParams<PostViewModel>): Promise<Paginator<PostViewModel>> {
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

        return {
            pagesCount: Math.ceil((totalCount / pagingParams.pageSize) || 1),
            page: pagingParams.pageNumber,
            pageSize: pagingParams.pageSize,
            totalCount,
            items: foundPosts.map(this.postMapperToView),
        }
    }

    async getPostById(id: string): Promise<PostViewModel | null> {
        const foundPost: PostDocument | null = await PostModel.findById(id)
        return foundPost ? this.postMapperToView(foundPost) : null
    }

    private postMapperToView(post: PostDocument): PostViewModel {
        return {
            id: post._id.toString(),
            title: post.title,
            shortDescription: post.shortDescription,
            content: post.content,
            blogId: post.blogId.toString(),
            blogName: post.blogName,
            createdAt: post.createdAt.toISOString(),
        }
    }
}
