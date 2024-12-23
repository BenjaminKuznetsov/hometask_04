import { ResultType } from "../../../common/result/result.type"
import { ConfirmationStatus, TPasswordRecovery, UserDocument, UserInputModel } from "../../user/domain/userModels"
import { usersRepo } from "../../user/infra/usersRepo"
import { resultHelpers } from "../../../common/result/helpers"
import { bcryptService } from "../../../common/adapters/bcrypt.service"
import { jwtService } from "../../../common/adapters/jwt.service"
import { usersService } from "../../user/application/usersService"
import { emailManager } from "../../../common/managers/email.manager"
import { v4 as uuidv4 } from "uuid"
import { add } from "date-fns"
import { LoginUserDTO, TTokenPair } from "../domain/auth.types"
import { Session, SessionUpdateDTO } from "../../sessions/domain/sessions.model"
import { sessionsRepo } from "../../sessions/infra/sessions.repo"
import { RefreshTokenPayload } from "../../../common/types/types"

export const authService = {
    async checkCredentials(loginOrEmail: string, password: string): Promise<ResultType<UserDocument | null>> {
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

        const newSession: Session = {
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

    async verifyRefreshToken(token: string): Promise<ResultType<RefreshTokenPayload | null>> {
        const jwtResult = await jwtService.verifyToken(token)
        if (!resultHelpers.isSuccess(jwtResult)) {
            return resultHelpers.unauthorized()
        }

        const doesSessionExists = await sessionsRepo.doesSessionExists(jwtResult.data as RefreshTokenPayload)
        if (!doesSessionExists) {
            return resultHelpers.unauthorized()
        }

        return resultHelpers.success(jwtResult.data as RefreshTokenPayload)
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
        const user: UserDocument | null = await usersRepo.getUserByFilter({ email })

        if (!user) {
            return resultHelpers.badRequest({ field: "email", message: "User with such email doesn`t exist" })
        }

        if (user.emailConfirmation.confirmationStatus !== ConfirmationStatus.NOT_CONFIRMED) {
            return resultHelpers.badRequest({ field: "email", message: "User with this email is already confirmed" })
        }

        user.emailConfirmation.confirmationCode = uuidv4()
        user.emailConfirmation.expirationDate = add(new Date(), {
            hours: 1,
            minutes: 30,
        })

        await usersRepo.save(user)

        emailManager.userRegistrationConfirmation(user)

        return resultHelpers.success(true)
    },
    async passwordRecovery(email: string): Promise<ResultType<true | null>> {
        const user: UserDocument | null = await usersRepo.getUserByFilter({ email })
        if (!user) {
            return resultHelpers.notFound()
        }

        const recoveryData: TPasswordRecovery = {
            recoveryCode: uuidv4(),
            expirationDate: add(new Date(), {
                seconds: 5,
            }),
        }

        user.passwordRecovery = (recoveryData)
        await usersRepo.save(user)

        emailManager.userRecoveryPassword(user)

        return resultHelpers.success(true)
    },
    async newPassword(recoveryCode: string, newPassword: string): Promise<ResultType<true | null>> {
        const user = await usersRepo.getUserByRecoveryCode(recoveryCode)
        if (!user) {
            return resultHelpers.badRequest({ field: "recoveryCode", message: "Recovery code is not correct" })
        }

        if (user.passwordRecovery!.expirationDate! < new Date()) {
            return resultHelpers.badRequest({ field: "recoveryCode", message: "Recovery code is expired" })
        }

        const passwordHash = await bcryptService.generateHash(newPassword)
        user.passwordHash = passwordHash
        user.passwordRecovery = null
        await usersRepo.save(user)

        return resultHelpers.success(true)
    },
}