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
    getPostById: async (id: string): Promise<PostViewModel | null> => {
        const _id = new ObjectId(id)
        const foundPost = await postsCollection.findOne({ _id })
        return foundPost ? dbToViewMapper(foundPost) : null
    },
    createPost: async (newPost: PostDBModel): Promise<PostViewModel> => {
        await postsCollection.insertOne(newPost)
        return dbToViewMapper(newPost as WithId<PostDBModel>)

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
