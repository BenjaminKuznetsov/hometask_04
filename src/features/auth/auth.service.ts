import { ResultType } from "../../common/result/result.type"
import { TUserWithId } from "../user/userModels"
import { usersRepo } from "../user/usersRepo"
import { resultHelpers } from "../../common/result/helpers"
import { bcryptService } from "../../common/adapters/bcrypt.service"
import { jwtService } from "../../common/adapters/jwt.service"

export const authService = {
    async checkCredentials(loginOrEmail: string, password: string): Promise<ResultType<TUserWithId | null>> {
        const user = await usersRepo.getUserByLoginOrEmailAndHash(loginOrEmail)
        if (!user) {
            return resultHelpers.notFound()
        }

        const isPasswordCorrect = await bcryptService.checkPassword(password, user.passwordHash)

        if (!isPasswordCorrect) {
            return resultHelpers.unauthorized()
        }

        return resultHelpers.success(user)
    },

    async loginUser(loginOrEmail: string, password: string): Promise<ResultType<{ accessToken: string } | null>> {
        const result = await this.checkCredentials(loginOrEmail, password)

        if (!resultHelpers.isSuccess(result)) {
            return resultHelpers.unauthorized()
        }

        const accessToken = await jwtService.createToken(result.data.id)

        return resultHelpers.success({ accessToken })
    },

}