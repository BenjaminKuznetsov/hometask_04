import { db } from "../../src/db/mongo"
import { ObjectId } from "mongodb"
import { authService } from "../../src/features/auth/auth.service"
import { mockUsers } from "../helpers/mock-data"
import { ResultStatus } from "../../src/common/result/result.type"
import { emailAdapter } from "../../src/common/adapters/email.adapter"
import { emailManager } from "../../src/common/managers/email.manager"
import { UserDocument, UserModel } from "../../src/features/user/userModels"

describe("user registration", () => {

    let user: UserDocument

    beforeAll(async () => {
        await db.run()
        await db.drop()
    })

    afterAll(async () => {
        await db.stop()
    })

    // afterEach(() => {
    //     // restore the spy created with spyOn
    //     // console.log("spy.mock.calls", spy.mock.calls)
    //     // jest.restoreAllMocks()
    //     // console.log("spy.mock.calls", spy.mock.calls)
    // })

    emailAdapter.sendEmail = jest.fn().mockImplementation(() => Promise.resolve(true))
    const sendEmailMock = emailAdapter.sendEmail as jest.Mock

    const registerUserUseCase = authService.registerUser
    const confirmUserUseCase = authService.confirmUserRegistration
    const resenCodeUseCase = authService.resendUserConfirmationEmail

    const spy = jest.spyOn(emailManager, "userRegistrationConfirmation")

    it("should register user", async () => {
        const result = await registerUserUseCase(mockUsers[0])
        expect(result.status).toBe(ResultStatus.Success)
        expect(emailAdapter.sendEmail).toBeCalledTimes(1)
        expect(spy).toBeCalledTimes(1)
        user = spy.mock.calls[0][0]
    })

    it("should not register user twice", async () => {
        const result = await registerUserUseCase(mockUsers[0])
        expect(result.status).toBe(ResultStatus.BadRequest)
    })

    it("shouldn`t confirm user registration without confirmation code", async () => {
        const result = await confirmUserUseCase("")
        expect(result.status).toBe(ResultStatus.BadRequest)
    })

    it("shouldn`t confirm user registration with wrong confirmation code", async () => {
        const result = await confirmUserUseCase("wrong confirmation code")
        expect(result.status).toBe(ResultStatus.BadRequest)
    })

    it("should confirm user registration", async () => {
        const result = await confirmUserUseCase(user.emailConfirmation.confirmationCode!)
        expect(result.status).toBe(ResultStatus.Success)
    })

    it("shouldn`t confirm user registration twice", async () => {
        const result = await confirmUserUseCase(user.emailConfirmation.confirmationCode!)
        expect(result.status).toBe(ResultStatus.BadRequest)
        expect(result.extensions[0].message).toBe("Confirmation code is already applied")
    })

    it("shouldn`t confirm user registration with expired confirmation code", async () => {
        const result = await registerUserUseCase(mockUsers[1])
        expect(result.status).toBe(ResultStatus.Success)
        const newUser = spy.mock.calls[0][0]
        await UserModel.updateOne({ _id: new ObjectId(newUser.id) }, { $set: { "emailConfirmation.expirationDate": new Date() } })
        const result2 = await confirmUserUseCase(newUser.emailConfirmation.confirmationCode!)
        expect(result2.status).toBe(ResultStatus.BadRequest)
    })

    it("shouldn`t resend user confirmation email if user is already confirmed ", async () => {
        const result = await resenCodeUseCase(user.email)
        expect(result.status).toBe(ResultStatus.BadRequest)
    })

    it("shouldn`t resend user confirmation email if user with such email doesn`t exist", async () => {
        const result = await resenCodeUseCase("user1@user1.com")
        expect(result.status).toBe(ResultStatus.BadRequest)
    })

    it("should resend user confirmation email", async () => {
        const result = await registerUserUseCase(mockUsers[2])
        expect(result.status).toBe(ResultStatus.Success)
        const newUser = spy.mock.calls[2][0]
        const emailSenderCallsCount = sendEmailMock.mock.calls.length
        const result2 = await resenCodeUseCase(newUser.email)
        expect(result2.status).toBe(ResultStatus.Success)
        expect(emailAdapter.sendEmail).toBeCalledTimes(emailSenderCallsCount + 1)
    })

})
