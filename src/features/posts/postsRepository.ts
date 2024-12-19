import { Post, PostModel } from "./post.model"
import { ObjectId } from "mongodb"

export const postsRepository = {
    _isValidId: (id: string): boolean => {
        return ObjectId.isValid(id)
    },
    async createPost(newPost: Post): Promise<string> {
        const createdPost = await PostModel.create(newPost)
        return createdPost._id.toString()
    },
    async updatePost(id: string, updatedPost: Partial<Post>): Promise<boolean> {
        // TODO: move searching blog to service
        const _id = new ObjectId(id)
        const result = await PostModel.updateOne({ _id }, { $set: { ...updatedPost } })
        return !!result.matchedCount
    },
    async deletePost(id: string): Promise<boolean> {
        const _id = new ObjectId(id)
        const result = await PostModel.deleteOne({ _id })
        return !!result.deletedCount
    },

    async doesExistById(id: string): Promise<boolean> {
        if (!this._isValidId(id)) {
            return false
        }
        const _id = new ObjectId(id)
        const foundPost = await PostModel.findOne({ _id })
        return !!foundPost
    },

}
