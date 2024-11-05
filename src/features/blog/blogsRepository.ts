import { BlogDBModel, BlogInputModel, BlogSearchParams, BlogViewModel } from "./blogModels"
import { blogsCollection } from "../../db/mongo"
import { ObjectId, WithId } from "mongodb"

function removeObjectId(blog: WithId<BlogDBModel>): BlogViewModel {
    return {
        ...blog,
        id: blog._id.toString(),
    }
}

export const blogsRepository = {
    getBlogs: async (queryParams: BlogSearchParams): Promise<BlogViewModel[]> => {

        const filter: Record<string, unknown> = {}
        if (queryParams.searchNameTerm) {
            filter.name = { $regex: queryParams.searchNameTerm, $options: "i" }
        }

        const foundBlogs = await blogsCollection
            .find(filter)
            .sort(queryParams.sortBy, queryParams.sortDirection)
            .skip((queryParams.pageNumber - 1) * queryParams.pageSize)
            .limit(queryParams.pageSize)
            .toArray()
        return foundBlogs.map(removeObjectId)
    },
    getBlogsCount: async (): Promise<number> => {
        return await blogsCollection.countDocuments()
    },
    getBlogById: async (id: string): Promise<BlogViewModel | null> => {
        const _id = new ObjectId(id)
        const foundBlog = await blogsCollection.findOne({ _id })
        return foundBlog ? removeObjectId(foundBlog) : null
    },
    createBlog: async (newBlog: BlogDBModel): Promise<BlogViewModel> => {
        await blogsCollection.insertOne(newBlog)
        return removeObjectId(newBlog as WithId<BlogDBModel>)
    },
    updateBlog: async (id: string, input: BlogInputModel): Promise<boolean> => {
        const _id = new ObjectId(id)
        const result = await blogsCollection.updateOne({ _id: _id }, { $set: input })
        return !!result.matchedCount
    },
    deleteBlog: async (id: string): Promise<boolean> => {
        const _id = new ObjectId(id)
        const result = await blogsCollection.deleteOne({ _id })
        return !!result.deletedCount
    },
}
