import { UserDBModel, UserInputModel } from "./userModels"
import { usersRepo } from "./usersRepo"
import { ResultType } from "../../common/result/result.type"
import { resultHelpers } from "../../common/result/helpers"
import { bcryptService } from "../../common/adapters/bcrypt.service"

export const usersService = {

    async createUser(input: UserInputModel): Promise<ResultType<{ createdUserId: string } | null>> {
        const userWithSuchLogin = await usersRepo.getUserByFilter({ login: input.login })
        if (userWithSuchLogin) {
            return resultHelpers.badRequest({ field: "login", message: "User with such login already exists" })
        }

        const userWithSuchEmail = await usersRepo.getUserByFilter({ email: input.email })
        if (userWithSuchEmail) {
            return resultHelpers.badRequest({ field: "email", message: "User with such email already exists" })
        }

        const passwordHash = await bcryptService.generateHash(input.password)

        const newUser: UserDBModel = {
            login: input.login,
            email: input.email,
            passwordHash: passwordHash,
            createdAt: new Date().toISOString(),
        }
        const newUserId = await usersRepo.createUser(newUser)

        return resultHelpers.success({ createdUserId: newUserId })
    },

    async deleteUser(id: string): Promise<boolean> {
        return await usersRepo.deleteUser(id)
    },
}
