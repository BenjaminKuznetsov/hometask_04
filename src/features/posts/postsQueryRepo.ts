import { PostDBModel, PostSearchParams, PostViewModel } from "./postModels"
import { postsCollection } from "../../db/mongo"
import { ObjectId, WithId } from "mongodb"
import { Paginator, PagingParams } from "../../types"

function dbToViewMapper(post: WithId<PostDBModel>): PostViewModel {
    return {
        ...post,
        id: post._id.toString(),
    }
}

export const postsQueryRepo = {
    getPostsWithPagingAndFilter: async (searchParams: PostSearchParams, pagingParams: PagingParams<PostViewModel>): Promise<Paginator<PostViewModel>> => {
        const filter: Record<string, unknown> = {}
        if (searchParams.blogId) {
            filter.blogId = new ObjectId(searchParams.blogId)
        }

        const foundPosts = await postsCollection
            .find(filter)
            .sort(pagingParams.sortBy, pagingParams.sortDirection)
            .skip((pagingParams.pageNumber - 1) * pagingParams.pageSize)
            .limit(pagingParams.pageSize)
            .toArray()

        const totalCount = await postsCollection.countDocuments(filter)

        return {
            pagesCount: Math.ceil((totalCount / pagingParams.pageSize) || 1),
            page: pagingParams.pageNumber,
            pageSize: pagingParams.pageSize,
            totalCount,
            items: foundPosts.map(dbToViewMapper),
        }
    },
    getPostById: async (id: string): Promise<PostViewModel | null> => {
        const _id = new ObjectId(id)
        const foundPost = await postsCollection.findOne({ _id })
        return foundPost ? dbToViewMapper(foundPost) : null
    },
}
