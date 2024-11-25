import { BlogDBModel, BlogSearchParams, BlogViewModel } from "./blogModels"
import { blogsCollection } from "../../db/mongo"
import { ObjectId, WithId } from "mongodb"
import { Paginator, PagingParams } from "../../common/types/types"

function blogMapperToView(blog: WithId<BlogDBModel>): BlogViewModel {
    return {
        id: blog._id.toString(),
        name: blog.name,
        description: blog.description,
        websiteUrl: blog.websiteUrl,
        createdAt: blog.createdAt,
        isMembership: blog.isMembership,
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
            items: foundBlogs.map(blogMapperToView),
        }

    },
    getBlogById: async (id: string): Promise<BlogViewModel | null> => {
        const _id = new ObjectId(id)
        const foundBlog = await blogsCollection.findOne({ _id })
        return foundBlog ? blogMapperToView(foundBlog) : null
    },
}
