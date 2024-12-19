import { BlogDocument, BlogModel, BlogSearchParams, BlogViewModel } from "./blog.model"
import { Paginator, PagingParams } from "../../common/types/types"

function blogMapperToView(blog: BlogDocument): BlogViewModel {
    return {
        id: blog._id.toString(),
        name: blog.name,
        description: blog.description,
        websiteUrl: blog.websiteUrl,
        createdAt: blog.createdAt.toISOString(),
        isMembership: blog.isMembership,
    }
}

export const blogsQueryRepo = {
    getBlogsWithPagingAndFilter: async (searchParams: BlogSearchParams, pagingParams: PagingParams<BlogViewModel>): Promise<Paginator<BlogViewModel>> => {

        const filter: Record<string, unknown> = {}
        if (searchParams.searchNameTerm) {
            filter.name = { $regex: searchParams.searchNameTerm, $options: "i" }
        }

        const foundBlogs: BlogDocument[] = await BlogModel
            .find(filter, null, {
                sort: { [pagingParams.sortBy]: pagingParams.sortDirection },
                skip: (pagingParams.pageNumber - 1) * pagingParams.pageSize,
                limit: pagingParams.pageSize,
            })

        const totalCount = await BlogModel.countDocuments(filter)

        return {
            pagesCount: Math.ceil((totalCount / pagingParams.pageSize) || 1),
            page: pagingParams.pageNumber,
            pageSize: pagingParams.pageSize,
            totalCount,
            items: foundBlogs.map(blogMapperToView),
        }

    },
    getBlogById: async (id: string): Promise<BlogViewModel | null> => {
        const foundBlog: BlogDocument | null = await BlogModel.findById(id)
        return foundBlog ? blogMapperToView(foundBlog) : null
    },
}
