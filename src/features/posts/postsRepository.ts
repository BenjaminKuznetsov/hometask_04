import { PostDBModel, PostViewModel } from "./postModels"
import { postsCollection } from "../../db/mongo"
import { ObjectId, WithId } from "mongodb"

function removeObjectId(post: WithId<PostDBModel>): PostViewModel {
    return {
        ...post,
        id: post._id.toString(),
    }
}

export const postsRepository = {
    getAllPosts: async (): Promise<PostViewModel[]> => {
        const foundPosts = await postsCollection.find().toArray()
        return foundPosts.map(removeObjectId)
    },
    getPostById: async (id: string): Promise<PostViewModel | null> => {
        const _id = new ObjectId(id)
        const foundPost = await postsCollection.findOne({ _id })
        return foundPost ? removeObjectId(foundPost) : null
    },
    createPost: async (newPost: PostDBModel): Promise<PostViewModel> => {
        await postsCollection.insertOne(newPost)
        return removeObjectId(newPost as WithId<PostDBModel>)

    },
    updatePost: async (id: string, updatedPost: Partial<PostDBModel>): Promise<boolean> => {
        // TODO: move searching blog to service
        const _id = new ObjectId(id)
        const result = await postsCollection.updateOne({ _id }, { $set: { ...updatedPost } })
        return !!result.matchedCount
    },
    deletePost: async (id: string): Promise<boolean> => {
        const _id = new ObjectId(id)
        const result = await postsCollection.deleteOne({ _id })
        return !!result.deletedCount
    },
}
