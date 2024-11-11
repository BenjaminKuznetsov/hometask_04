import { UserDBModel, UserSearchParams, UserViewModel } from "./userModels"
import { usersCollection } from "../../db/mongo"
import { ObjectId, WithId } from "mongodb"
import { Paginator, PagingParams } from "../../types"

function userMapperToView(user: WithId<UserDBModel>): UserViewModel {
    return {
        id: user._id.toString(),
        login: user.login,
        email: user.email,
        createdAt: user.createdAt,
    }
}

export const usersQueryRepo = {
    getUsersWithPagingAndFilter: async (searchParams: UserSearchParams, pagingParams: PagingParams<UserViewModel>): Promise<Paginator<UserViewModel>> => {

        const filter: Record<string, unknown[]> = {}

        if (searchParams.searchLoginTerm || searchParams.searchEmailTerm) {
            filter.$or = []
            if (searchParams.searchLoginTerm) {
                filter.$or.push({ login: { $regex: searchParams.searchLoginTerm, $options: "i" } })
            }

            if (searchParams.searchEmailTerm) {
                filter.$or.push({ email: { $regex: searchParams.searchEmailTerm, $options: "i" } })
            }
        }

        const foundUsers = await usersCollection
            .find(filter)
            .sort(pagingParams.sortBy, pagingParams.sortDirection)
            .skip((pagingParams.pageNumber - 1) * pagingParams.pageSize)
            .limit(pagingParams.pageSize)
            .toArray()

        const totalCount = await usersCollection.countDocuments(filter)

        return {
            pagesCount: Math.ceil((totalCount / pagingParams.pageSize) || 1),
            page: pagingParams.pageNumber,
            pageSize: pagingParams.pageSize,
            totalCount,
            items: foundUsers.map(userMapperToView),
        }
    },

    getUserById: async (id: string): Promise<UserViewModel | null> => {
        const foundUser = await usersCollection.findOne({ _id: new ObjectId(id) })
        return foundUser ? userMapperToView(foundUser) : null
    },
}
