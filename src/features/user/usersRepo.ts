import { ObjectId, WithId } from "mongodb"
import { usersCollection } from "../../db/mongo"
import { ConfirmationStatus, TUserWithId, UserDBFilter, UserDBModel } from "./userModels"

function removeObjectId(user: WithId<UserDBModel>): TUserWithId {
    return {
        ...user,
        id: user._id.toString(),
    }
}

export const usersRepo = {
    _isValidId(id: string): boolean {
        return ObjectId.isValid(id)
    },

    _deleteStringId(input: TUserWithId): UserDBModel {
        return {
            login: input.login,
            email: input.email,
            passwordHash: input.passwordHash,
            createdAt: input.createdAt,
            emailConfirmation: input.emailConfirmation,
        }
    },

    async getUserByFilter(filter: UserDBFilter): Promise<TUserWithId | null> {
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

    async getUserByLoginOrEmail(loginOrEmail: string): Promise<TUserWithId | null> {
        let foundUser
        if (loginOrEmail.includes("@")) {
            foundUser = await usersCollection.findOne({ email: loginOrEmail })
        } else {
            foundUser = await usersCollection.findOne({ login: loginOrEmail })
        }

        return foundUser ? removeObjectId(foundUser) : null
    },

    async getUserById(id: string): Promise<TUserWithId | null> {
        const _id = new ObjectId(id)
        const foundUser = await usersCollection.findOne({ _id })
        return foundUser ? removeObjectId(foundUser) : null
    },

    async doesExistById(id: string): Promise<boolean> {
        if (!this._isValidId(id)) {
            return false
        }
        const _id = new ObjectId(id)
        const foundUser = await usersCollection.findOne({ _id })
        return !!foundUser
    },

    async getUserByConfirmationCode(code: string): Promise<TUserWithId | null> {
        const foundUser = await usersCollection.findOne({
            "emailConfirmation.confirmationCode": code,
        })
        return foundUser ? removeObjectId(foundUser) : null
    },

    async createUser(newUser: UserDBModel): Promise<string> {
        const result = await usersCollection.insertOne(newUser)
        return result.insertedId.toString()
    },

    async updateUser(userId: string, newData: UserDBModel): Promise<boolean> {
        const _id = new ObjectId(userId)
        const result = await usersCollection.updateOne({ _id }, { $set: newData })
        return !!result.modifiedCount
    },

    async setUserAsConfirmed(userId: string): Promise<boolean> {
        const result = await usersCollection.updateOne(
            { _id: new ObjectId(userId) },
            { $set: { "emailConfirmation.confirmationStatus": ConfirmationStatus.CONFIRMED } },
        )
        return !!result.modifiedCount
    },

    async deleteUser(id: string): Promise<boolean> {
        if (!this._isValidId(id)) {
            return false
        }
        const _id = new ObjectId(id)
        const result = await usersCollection.deleteOne({ _id })
        return !!result.deletedCount
    },
}
