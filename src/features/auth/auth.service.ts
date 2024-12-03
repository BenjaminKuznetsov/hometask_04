import { ResultType } from "../../common/result/result.type"
import { ConfirmationStatus, TEmailConfirmation, TUserWithId, UserDBModel, UserInputModel } from "../user/userModels"
import { usersRepo } from "../user/usersRepo"
import { resultHelpers } from "../../common/result/helpers"
import { bcryptService } from "../../common/adapters/bcrypt.service"
import { jwtService } from "../../common/adapters/jwt.service"
import { usersService } from "../user/usersService"
import { emailManager } from "../../common/managers/email.manager"
import { v4 as uuidv4 } from "uuid"
import { add } from "date-fns"
import { authRepo } from "./auth.repo"
import { TTokenPair } from "./auth.types"

export const authService = {
    async checkCredentials(loginOrEmail: string, password: string): Promise<ResultType<TUserWithId | null>> {
        const user = await usersRepo.getUserByLoginOrEmail(loginOrEmail)
        if (!user) {
            return resultHelpers.notFound()
        }

        const isPasswordCorrect = await bcryptService.checkPassword(password, user.passwordHash)

        if (!isPasswordCorrect) {
            return resultHelpers.unauthorized()
        }

        return resultHelpers.success(user)
    },
    async loginUser(loginOrEmail: string, password: string): Promise<ResultType<TTokenPair | null>> {
        const result = await this.checkCredentials(loginOrEmail, password)

        if (!resultHelpers.isSuccess(result)) {
            return resultHelpers.unauthorized()
        }

        const accessToken = await jwtService.createAccessToken(result.data.id)
        const refreshToken = await jwtService.createRefreshToken(result.data.id)

        return resultHelpers.success({ accessToken, refreshToken })
    },

    async refreshUserTokens(token: string): Promise<ResultType<TTokenPair | null>> {

        const isTokenInvalid = await authRepo.checkIsTokenInvalid(token)
        if (isTokenInvalid) {
            return resultHelpers.unauthorized()
        }

        const result = await jwtService.verifyToken(token)
        if (!resultHelpers.isSuccess(result)) {
            return resultHelpers.unauthorized()
        }

        const doesUserExist = await usersRepo.doesExistById(result.data.userId)
        if (!doesUserExist) {
            return resultHelpers.unauthorized()
        }

        await authRepo.addInvalidToken(token)

        const newAccessToken = await jwtService.createAccessToken(result.data.userId)
        const newRefreshToken = await jwtService.createRefreshToken(result.data.userId)

        return resultHelpers.success({ accessToken: newAccessToken, refreshToken: newRefreshToken })
    },

    async logOutUser(token: string): Promise<ResultType<true | null>> {

        const isTokenInvalid = await authRepo.checkIsTokenInvalid(token)
        if (isTokenInvalid) {
            return resultHelpers.unauthorized()
        }

        const result = await jwtService.verifyToken(token)
        if (!resultHelpers.isSuccess(result)) {
            return resultHelpers.unauthorized()
        }

        const doesUserExist = await usersRepo.doesExistById(result.data.userId)
        if (!doesUserExist) {
            return resultHelpers.unauthorized()
        }

        await authRepo.addInvalidToken(token)

        return resultHelpers.success(true)
    },

    async registerUser(input: UserInputModel): Promise<ResultType<true | null>> {

        const result = await usersService.createUser(input)

        if (resultHelpers.isNotSuccess(result)) {
            return result
        }

        const createdUser = await usersRepo.getUserById(result.data!.createdUserId)

        emailManager.userRegistrationConfirmation(createdUser!)

        return resultHelpers.success(true)
    },

    async confirmUserRegistration(code: string): Promise<ResultType<true | null>> {
        if (!code) {
            return resultHelpers.badRequest({ field: "code", message: "Confirmation code is required" })
        }

        const user = await usersRepo.getUserByConfirmationCode(code)

        if (!user) {
            return resultHelpers.badRequest({ field: "code", message: "Confirmation code is not correct" })
        }

        if (user.emailConfirmation.confirmationStatus !== ConfirmationStatus.NOT_CONFIRMED) {
            return resultHelpers.badRequest({ field: "code", message: "Confirmation code is already applied" })
        }

        if (user.emailConfirmation.expirationDate! < new Date()) {
            return resultHelpers.badRequest({ field: "code", message: "Confirmation code is expired" })
        }

        await usersRepo.setUserAsConfirmed(user.id)

        return resultHelpers.success(true)
    },

    async resendUserConfirmationEmail(email: string): Promise<ResultType<true | null>> {
        const user = await usersRepo.getUserByFilter({ email })

        if (!user) {
            return resultHelpers.badRequest({ field: "email", message: "User with such email doesn`t exist" })
        }

        if (user.emailConfirmation.confirmationStatus !== ConfirmationStatus.NOT_CONFIRMED) {
            return resultHelpers.badRequest({ field: "email", message: "User with this email is already confirmed" })
        }

        const newEmailConfirmationData: TEmailConfirmation = {
            confirmationStatus: ConfirmationStatus.NOT_CONFIRMED,
            confirmationCode: uuidv4(),
            expirationDate: add(new Date(), {
                hours: 1,
                minutes: 30,
            }),
        }

        const newUserData: UserDBModel = {
            login: user.login,
            email: user.email,
            passwordHash: user.passwordHash,
            createdAt: user.createdAt,
            emailConfirmation: newEmailConfirmationData,
        }

        await usersRepo.updateUser(user.id, newUserData)

        emailManager.userRegistrationConfirmation({ id: user.id, ...newUserData })

        return resultHelpers.success(true)
    },
}