import { Blog, BlogDocument, BlogInputModel, BlogModel } from "../domain/blog.model"
import { ObjectId } from "mongodb"
import { injectable } from "inversify"

@injectable()
export class BlogsRepository {
    async getBlogById(id: string): Promise<BlogDocument | null> {
        return await BlogModel.findById(id) as BlogDocument
    }

    async createBlog(newBlog: Blog): Promise<string> {
        const createdBlog = await BlogModel.create(newBlog)
        return createdBlog._id.toString()
    }

    async updateBlog(id: string, input: BlogInputModel): Promise<boolean> {
        const _id = new ObjectId(id)
        const result = await BlogModel.updateOne({ _id: _id }, { $set: input })
        return !!result.matchedCount
    }

    async deleteBlog(id: string): Promise<boolean> {
        const _id = new ObjectId(id)
        const result = await BlogModel.deleteOne({ _id })
        return !!result.deletedCount
    }
}

