import { BlogDBModel, BlogSearchParams, BlogViewModel } from "./blogModels"
import { blogsCollection } from "../../db/mongo"
import { ObjectId, WithId } from "mongodb"
import { Paginator, PagingParams } from "../../types"

function removeObjectId(blog: WithId<BlogDBModel>): BlogViewModel {
    return {
        ...blog,
        id: blog._id.toString(),
    }
}

export const blogsQueryRepo = {
    getBlogsWithPagingAndFilter: async (searchParams: BlogSearchParams, pagingParams: PagingParams<BlogViewModel>): Promise<Paginator<BlogViewModel>> => {

        const filter: Record<string, unknown> = {}
        if (searchParams.searchNameTerm) {
            filter.name = { $regex: searchParams.searchNameTerm, $options: "i" }
        }

        const foundBlogs = await blogsCollection
            .find(filter)
            .sort(pagingParams.sortBy, pagingParams.sortDirection)
            .skip((pagingParams.pageNumber - 1) * pagingParams.pageSize)
            .limit(pagingParams.pageSize)
            .toArray()

        const totalCount = await blogsCollection.countDocuments(filter)

        return {
            pagesCount: Math.ceil((totalCount / pagingParams.pageSize) || 1),
            page: pagingParams.pageNumber,
            pageSize: pagingParams.pageSize,
            totalCount,
            items: foundBlogs.map(removeObjectId),
        }

    },
    getBlogById: async (id: string): Promise<BlogViewModel | null> => {
        const _id = new ObjectId(id)
        const foundBlog = await blogsCollection.findOne({ _id })
        return foundBlog ? removeObjectId(foundBlog) : null
    },
}
