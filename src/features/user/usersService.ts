import { UserDBModel, UserInputModel } from "./userModels"
import { usersRepo } from "./usersRepo"
import bcrypt from "bcrypt"

type ResultObject = {
    status: "success" | "error"
    createdUserId?: string
    field?: string
    message?: string
}

export const usersService = {

    async createUser(input: UserInputModel): Promise<ResultObject> {
        const userWithSuchLogin = await usersRepo.getUserByFilter({ login: input.login })
        if (userWithSuchLogin) {
            return {
                status: "error",
                field: "login",
                message: "User with such login already exists",
            }
        }

        const userWithSuchEmail = await usersRepo.getUserByFilter({ email: input.email })
        if (userWithSuchEmail) {
            return {
                status: "error",
                field: "email",
                message: "User with such email already exists",
            }
        }

        const passwordHash = await bcrypt.hash(input.password, 10)

        const newUser: UserDBModel = {
            login: input.login,
            email: input.email,
            passwordHash: passwordHash,
            createdAt: new Date().toISOString(),
        }
        const newUserId = await usersRepo.createUser(newUser)

        return {
            status: "success",
            createdUserId: newUserId,
        }
    },

    async checkCredentials(loginOrEmail: string, password: string): Promise<boolean> {
        const user = await usersRepo.getUserByLoginOrEmailAndHash(loginOrEmail)
        if (!user) {
            return false
        }

        return await bcrypt.compare(password, user.passwordHash)
    },

    async deleteUser(id: string): Promise<boolean> {
        return await usersRepo.deleteUser(id)
    },
}
