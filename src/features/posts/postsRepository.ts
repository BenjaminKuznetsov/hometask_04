import { PostDBModel, PostViewModel } from "./postModels"
import { postsCollection } from "../../db/mongo"
import { ObjectId, WithId } from "mongodb"

function dbToViewMapper(post: WithId<PostDBModel>): PostViewModel {
    return {
        ...post,
        id: post._id.toString(),
        blogId: post.blogId.toString(),
    }
}

export const postsRepository = {
    _isValidId: (id: string): boolean => {
        return ObjectId.isValid(id)
    },

    async getPostById(id: string): Promise<PostViewModel | null> {
        const _id = new ObjectId(id)
        const foundPost = await postsCollection.findOne({ _id })
        return foundPost ? dbToViewMapper(foundPost) : null
    },
    async createPost(newPost: PostDBModel): Promise<string> {
        const result = await postsCollection.insertOne(newPost)
        return result.insertedId.toString()
    },
    async updatePost(id: string, updatedPost: Partial<PostDBModel>): Promise<boolean> {
        // TODO: move searching blog to service
        const _id = new ObjectId(id)
        const result = await postsCollection.updateOne({ _id }, { $set: { ...updatedPost } })
        return !!result.matchedCount
    },
    async deletePost(id: string): Promise<boolean> {
        const _id = new ObjectId(id)
        const result = await postsCollection.deleteOne({ _id })
        return !!result.deletedCount
    },

    async doesExistById(id: string): Promise<boolean> {
        if (!this._isValidId(id)) {
            return false
        }
        const _id = new ObjectId(id)
        const foundPost = await postsCollection.findOne({ _id })
        return !!foundPost
    },

}
