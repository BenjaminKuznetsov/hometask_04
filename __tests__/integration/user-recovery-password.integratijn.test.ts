import { db } from "../../src/db/mongo"
import { authService } from "../../src/features/auth/application/auth.service"
import { ResultStatus } from "../../src/common/result/result.type"
import { emailAdapter } from "../../src/common/adapters/email.adapter"
import { emailManager } from "../../src/common/managers/email.manager"
import { e2eSeeder } from "../helpers/seeders"

describe("user password recovery", () => {

    beforeAll(async () => {
        await db.run()
        await db.drop()
    })

    afterAll(async () => {
        await db.stop()
    })

    afterEach(async () => {
        await db.drop()
    })

    emailAdapter.sendEmail = jest.fn().mockImplementation(() => Promise.resolve(true))
    const sendEmailMock = emailAdapter.sendEmail as jest.Mock

    const passwordRecoveryUseCase = authService.passwordRecovery
    const newPasswordUseCase = authService.newPassword

    const spy = jest.spyOn(emailManager, "userRecoveryPassword")

    it("shouldn`t send email if user isn`t registered", async () => {
        const result = await passwordRecoveryUseCase("user1@user1.com")
        expect(result.status).toBe(ResultStatus.NotFound)
        expect(sendEmailMock).toBeCalledTimes(0)
    })

    it("should send email and change password", async () => {
        const [ user ] = await e2eSeeder.users(1)
        const newPassword = "newPassword"

        // send email
        const result = await passwordRecoveryUseCase(user.email)
        expect(result.status).toBe(ResultStatus.Success)
        expect(sendEmailMock).toBeCalledTimes(1)
        const recoveryCode = spy.mock.lastCall![0].passwordRecovery!.recoveryCode

        // change password
        const result2 = await newPasswordUseCase(recoveryCode, newPassword)
        expect(result2.status).toBe(ResultStatus.Success)

        // shouldn`t login with old password
        const result3 = await authService.loginUser({ loginOrEmail: user.email, password: user.password })
        expect(result3.status).toBe(ResultStatus.Unauthorized)

        // should login with new password
        const result4 = await authService.loginUser({ loginOrEmail: user.email, password: newPassword })
        expect(result4.status).toBe(ResultStatus.Success)

        // shouldn`t change password with same recovery code twice
        const result5 = await newPasswordUseCase(recoveryCode, user.password)
        expect(result5.status).toBe(ResultStatus.BadRequest)
    })

    it.skip("shouldn`t change password with expired recovery code", async () => {
        const [ user ] = await e2eSeeder.users(1)
        await passwordRecoveryUseCase(user.email)
        const recoveryCode = spy.mock.lastCall![0].passwordRecovery!.recoveryCode
        // wait for 7 seconds
        await new Promise(resolve => setTimeout(resolve, 5000))
        const result2 = await newPasswordUseCase(recoveryCode, user.password)
        expect(result2.status).toBe(ResultStatus.BadRequest)
        expect(result2.extensions).toContainEqual({
            message: "Recovery code is expired",
            field: "recoveryCode",
        })
    }, 10000)

})
