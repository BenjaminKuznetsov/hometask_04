import { ObjectId, WithId, WithoutId } from "mongodb"
import { usersCollection } from "../../db/mongo"
import { UserDBFilter, UserDBModel } from "./userModels"

function removeObjectId(user: WithId<UserDBModel>): WithoutId<UserDBModel> {
    return {
        ...user,
        id: user._id.toString(),
    }
}

export const usersRepo = {
    getUserByFilter: async (filter: UserDBFilter): Promise<UserDBModel | null> => {
        const query: Record<string, unknown> = {}
        if (filter.login) {
            query.login = { $regex: filter.login, $options: "i" }
        }
        if (filter.email) {
            query.email = { $regex: filter.email, $options: "i" }
        }
        const foundUser = await usersCollection.findOne(query)
        return foundUser ? removeObjectId(foundUser) : null
    },

    getUserByLoginOrEmailAndHash: async (loginOrEmail: string, passwordHash: string): Promise<UserDBModel | null> => {
        let foundUser
        if (loginOrEmail.includes("@")) {
            foundUser = await usersCollection.findOne({ email: loginOrEmail, passwordHash })
        } else {
            foundUser = await usersCollection.findOne({ login: loginOrEmail, passwordHash })
        }
        return foundUser ? removeObjectId(foundUser) : null
    },

    // getUserById: async (id: string): Promise<UserDBModel | null> => {
    //     const _id = new ObjectId(id)
    //     const foundUser = await usersCollection.findOne({ _id })
    //     return foundUser ? removeObjectId(foundUser) : null
    // },

    createUser: async (newUser: UserDBModel): Promise<string> => {
        const result = await usersCollection.insertOne(newUser)
        return result.insertedId.toString()
    },

    deleteUser: async (id: string): Promise<boolean> => {
        const _id = new ObjectId(id)
        const result = await usersCollection.deleteOne({ _id })
        return !!result.deletedCount
    },
}
