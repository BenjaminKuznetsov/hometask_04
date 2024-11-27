import nodemailer from "nodemailer"
import { appConfig } from "../config/config"
import { ResultType } from "../result/result.type"
import { resultHelpers } from "../result/helpers"

export const emailAdapter = {
    sendEmail({ to, subject, html }: { to: string, subject: string, html: string }): ResultType<true> {

        const transport = nodemailer.createTransport({
            service: appConfig.mailService,
            auth: {
                user: appConfig.mailRuAddress,
                pass: appConfig.mailRuPass,
            },
        })

        transport.sendMail({
            from: `Benjamin <${appConfig.mailRuAddress}>`,
            to,
            subject,
            html,
        })
            // .then(info => console.log(info))
            .catch(e => console.error(e))

        return resultHelpers.success(true)
    },
}