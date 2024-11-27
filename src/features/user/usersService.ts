import { UserDBModel, UserInputModel, ConfirmationStatus, TEmailConfirmation } from "./userModels"
import { usersRepo } from "./usersRepo"
import { ResultType } from "../../common/result/result.type"
import { resultHelpers } from "../../common/result/helpers"
import { bcryptService } from "../../common/adapters/bcrypt.service"
import { v4 as uuidv4 } from "uuid"
import { add } from "date-fns"

export const usersService = {

    async createUser(input: UserInputModel, isCreatedByAdmin: boolean = false): Promise<ResultType<{
        createdUserId: string
    } | null>> {
        const userWithSuchLogin = await usersRepo.getUserByFilter({ login: input.login })
        if (userWithSuchLogin) {
            return resultHelpers.badRequest({ field: "login", message: "User with such login already exists" })
        }

        const userWithSuchEmail = await usersRepo.getUserByFilter({ email: input.email })
        if (userWithSuchEmail) {
            return resultHelpers.badRequest({ field: "email", message: "User with such email already exists" })
        }

        const passwordHash = await bcryptService.generateHash(input.password)

        const emailConfirmation: TEmailConfirmation = isCreatedByAdmin ?
            { confirmationStatus: ConfirmationStatus.CREATED_BY_ADMIN } :
            {
                confirmationStatus: ConfirmationStatus.NOT_CONFIRMED,
                confirmationCode: uuidv4(),
                expirationDate: add(new Date(), {
                    hours: 1,
                    minutes: 30,
                }),
            }

        const newUser: UserDBModel = {
            login: input.login,
            email: input.email,
            passwordHash: passwordHash,
            createdAt: new Date().toISOString(),
            emailConfirmation,
        }
        const newUserId = await usersRepo.createUser(newUser)

        return resultHelpers.success({ createdUserId: newUserId })
    },

    async deleteUser(id: string): Promise<boolean> {
        return await usersRepo.deleteUser(id)
    },
}
