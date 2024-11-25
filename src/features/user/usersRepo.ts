import { ObjectId, WithId } from "mongodb"
import { usersCollection } from "../../db/mongo"
import { TUserWithId, UserDBFilter, UserDBModel } from "./userModels"
import { bcryptService } from "../../common/adapters/bcrypt.service"

function removeObjectId(user: WithId<UserDBModel>): TUserWithId {
    return {
        ...user,
        id: user._id.toString(),
    }
}

export const usersRepo = {
  _isValidId: (id: string): boolean => {
    return ObjectId.isValid(id)
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

  async getUserByLoginOrEmailAndHash(loginOrEmail: string): Promise<TUserWithId | null> {
    let foundUser
    if (loginOrEmail.includes("@")) {
      foundUser = await usersCollection.findOne({ email: loginOrEmail })
    } else {
      foundUser = await usersCollection.findOne({ login: loginOrEmail })
    }

    return foundUser ? removeObjectId(foundUser) : null
  },

  getUserById: async (id: string): Promise<TUserWithId | null> => {
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

  async createUser(newUser: UserDBModel): Promise<string> {
    const result = await usersCollection.insertOne(newUser)
    return result.insertedId.toString()
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
