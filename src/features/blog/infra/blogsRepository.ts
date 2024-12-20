import { Blog, BlogDocument, BlogInputModel, BlogModel } from "../domain/blog.model"
import { ObjectId } from "mongodb"

export const blogsRepository = {
    getBlogById: async (id: string): Promise<BlogDocument | null> => {
        return await BlogModel.findById(id) as BlogDocument
    },
    createBlog: async (newBlog: Blog): Promise<string> => {
        const createdBlog = await BlogModel.create(newBlog)
        return createdBlog._id.toString()
    },
    updateBlog: async (id: string, input: BlogInputModel): Promise<boolean> => {
        const _id = new ObjectId(id)
        const result = await BlogModel.updateOne({ _id: _id }, { $set: input })
        return !!result.matchedCount
    },
    deleteBlog: async (id: string): Promise<boolean> => {
        const _id = new ObjectId(id)
        const result = await BlogModel.deleteOne({ _id })
        return !!result.deletedCount
    },
}
