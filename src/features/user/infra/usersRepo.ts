import { ObjectId } from "mongodb"
import { ConfirmationStatus, User, UserDBFilter, UserDocument, UserModel } from "../domain/userModels"

export const usersRepo = {
    _isValidId(id: string): boolean {
        return ObjectId.isValid(id)
    },

    async getUserByFilter(filter: UserDBFilter): Promise<UserDocument | null> {
        const query: Record<string, unknown> = {}
        if (filter.login) {
            query.login = { $regex: filter.login, $options: "i" }
        }
        if (filter.email) {
            query.email = { $regex: filter.email, $options: "i" }
        }
        return UserModel.findOne(query)
    },

    async getUserByLoginOrEmail(loginOrEmail: string): Promise<UserDocument | null> {
        let foundUser
        if (loginOrEmail.includes("@")) {
            foundUser = await UserModel.findOne({ email: loginOrEmail })
        } else {
            foundUser = await UserModel.findOne({ login: loginOrEmail })
        }
        return foundUser as UserDocument | null
    },

    async getUserById(id: string): Promise<UserDocument | null> {
        return UserModel.findById(id)
    },

    async doesExistById(id: string): Promise<boolean> {
        if (!this._isValidId(id)) {
            return false
        }
        const _id = new ObjectId(id)
        const foundUser = await UserModel.findOne({ _id })
        return !!foundUser
    },

    async getUserByConfirmationCode(code: string): Promise<UserDocument | null> {
        return UserModel.findOne({
            "emailConfirmation.confirmationCode": code,
        })
    },

    async getUserByRecoveryCode(code: string): Promise<UserDocument | null> {
        return UserModel.findOne({
            "passwordRecovery.recoveryCode": code,
        })
    },

    async createUser(newUser: User): Promise<string> {
        const createdUser = await UserModel.create(newUser)
        return createdUser._id.toString()
    },

    async save(user: UserDocument) {
        await user.save()
    },

    async setUserAsConfirmed(userId: string): Promise<boolean> {
        const result = await UserModel.updateOne(
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
        const result = await UserModel.deleteOne({ _id })
        return !!result.deletedCount
    },
}
