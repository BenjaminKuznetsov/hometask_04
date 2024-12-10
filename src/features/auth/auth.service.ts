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
import { LoginUserDTO, TTokenPair } from "./auth.types"
import { SessionsDBModel, SessionUpdateDTO } from "../sessions/sessions.types"
import { sessionsRepo } from "../sessions/sessions.repo"
import { RefreshTokenPayload } from "../../common/types/types"

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
    async loginUser({ loginOrEmail, password, ip, userAgent }: LoginUserDTO): Promise<ResultType<TTokenPair | null>> {
        const result = await this.checkCredentials(loginOrEmail, password)

        if (!resultHelpers.isSuccess(result)) {
            return resultHelpers.unauthorized()
        }

        const userId = result.data.id

        const deviceId = uuidv4()

        const accessToken = await jwtService.createAccessToken(userId)
        const refreshToken = await jwtService.createRefreshToken(userId, deviceId)

        const decodedRefreshToken = await jwtService.decodeToken(refreshToken) as RefreshTokenPayload
        // console.log("decodedRefreshToken", decodedRefreshToken)

        const newSession: SessionsDBModel = {
            user_id: userId,
            device_id: deviceId,
            user_agent: userAgent,
            ip: ip,
            iat: decodedRefreshToken.iat,
            exp: decodedRefreshToken.exp,
        }

        await sessionsRepo.createSession(newSession)

        return resultHelpers.success({ accessToken, refreshToken })
    },

    async refreshUserTokens(token: string): Promise<ResultType<TTokenPair | null>> {

        const result = await jwtService.verifyToken(token)
        if (!resultHelpers.isSuccess(result)) {
            return resultHelpers.unauthorized()
        }

        const userId = result.data.userId
        const deviceId = result.data.deviceId!

        const doesSessionExist = await sessionsRepo.doesSessionExists(result.data as RefreshTokenPayload)
        if (!doesSessionExist) {
            return resultHelpers.unauthorized()
        }

        const newAccessToken = await jwtService.createAccessToken(userId)
        const newRefreshToken = await jwtService.createRefreshToken(userId, deviceId)

        const decodedRefreshToken = await jwtService.decodeToken(newRefreshToken) as RefreshTokenPayload
        // console.log("decodedRefreshToken", decodedRefreshToken)

        const updateSessionDTO: SessionUpdateDTO = {
            user_id: userId,
            device_id: deviceId,
            iat: decodedRefreshToken.iat,
            exp: decodedRefreshToken.exp,
        }

        await sessionsRepo.updateSession(updateSessionDTO)

        return resultHelpers.success({ accessToken: newAccessToken, refreshToken: newRefreshToken })
    },

    async logOutUser(token: string): Promise<ResultType<true | null>> {

        const result = await jwtService.verifyToken(token)
        if (!resultHelpers.isSuccess(result)) {
            return resultHelpers.unauthorized()
        }

        const doesSessionExist = await sessionsRepo.doesSessionExists(result.data as RefreshTokenPayload)
        if (!doesSessionExist) {
            return resultHelpers.unauthorized()
        }

        await sessionsRepo.deleteSession(result.data.userId, result.data.deviceId!)

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