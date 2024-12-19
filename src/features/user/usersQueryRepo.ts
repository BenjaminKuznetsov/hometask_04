import { MeViewModel, UserDocument, UserModel, UserSearchParams, UserViewModel } from "./userModels"
import { Paginator, PagingParams } from "../../common/types/types"

function userMapperToView(user: UserDocument): UserViewModel {
    return {
        id: user._id.toString(),
        login: user.login,
        email: user.email,
        createdAt: user.createdAt.toISOString(),
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

        const foundUsers: UserDocument[] = await UserModel
            .find(filter, null, {
                sort: { [pagingParams.sortBy]: pagingParams.sortDirection },
                skip: (pagingParams.pageNumber - 1) * pagingParams.pageSize,
                limit: pagingParams.pageSize,
            })

        const totalCount = await UserModel.countDocuments(filter)

        return {
            pagesCount: Math.ceil((totalCount / pagingParams.pageSize) || 1),
            page: pagingParams.pageNumber,
            pageSize: pagingParams.pageSize,
            totalCount,
            items: foundUsers.map(userMapperToView),
        }
    },

    getUserById: async (id: string): Promise<UserViewModel | null> => {
        const foundUser: UserDocument | null = await UserModel.findById(id)
        return foundUser ? userMapperToView(foundUser) : null
    },

    async getMe(id: string): Promise<MeViewModel> {
        const foundUser = await UserModel.findById(id)
        return {
            userId: foundUser!._id.toString(),
            login: foundUser!.login,
            email: foundUser!.email,
        }
    },
}
