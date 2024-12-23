import { UserDocument } from "../../features/user/domain/userModels"
import { emailAdapter } from "../adapters/email.adapter"
import { ResultType } from "../result/result.type"
import { resultHelpers } from "../result/helpers"

export const emailManager = {
    userRegistrationConfirmation(user: UserDocument): ResultType<true> {
        const emailContent = `<h1>Thank for your registration</h1>
            <p>To finish registration please follow the link below:
                <a href='https://somesite.com/confirm-email?code=${user.emailConfirmation.confirmationCode}'>complete registration</a> 
            </p>`

        emailAdapter.sendEmail({
                to: user.email,
                subject: "Registration confirmation",
                html: emailContent,
            },
        )

        return resultHelpers.success(true)
    },
    userRecoveryPassword(user: UserDocument): ResultType<true> {
        const emailContent = `<h1>Password recovery</h1>
            <p>To recover password please follow the link below:
                <a href='https://somesite.com/recovery-password?code=${user.passwordRecovery!.recoveryCode}'>complete password recovery</a> 
            </p>`

        emailAdapter.sendEmail({
            to: user.email,
            subject: "Password recovery",
            html: emailContent,
        })

        return resultHelpers.success(true)
    },
}
