import { Post, PostDocument, PostModel } from "../domain/post.model"
import { ObjectId } from "mongodb"
import { injectable } from "inversify"

@injectable()
export class PostsRepository {
    _isValidId(id: string): boolean {
        return ObjectId.isValid(id)
    }

    async createPost(newPost: Post): Promise<string> {
        const createdPost = await PostModel.create(newPost)
        return createdPost._id.toString()
    }

    async updatePost(id: string, updatedPost: Partial<Post>): Promise<boolean> {
        const _id = new ObjectId(id)
        const result = await PostModel.updateOne({ _id }, { $set: { ...updatedPost } })
        return !!result.matchedCount
    }

    async deletePost(id: string): Promise<boolean> {
        const _id = new ObjectId(id)
        const result = await PostModel.deleteOne({ _id })
        return !!result.deletedCount
    }

    async doesExistById(id: string): Promise<boolean> {
        if (!this._isValidId(id)) {
            return false
        }
        const _id = new ObjectId(id)
        const foundPost = await PostModel.findOne({ _id })
        return !!foundPost
    }

    async getPostById(postId: string): Promise<PostDocument | null> {
        return PostModel.findById(postId)
    }
}
