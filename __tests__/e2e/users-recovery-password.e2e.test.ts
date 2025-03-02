import request from "supertest"
import { app } from "../../src/app"
import { paths } from "../../src/common/paths"
import { HttpStatus } from "../../src/common/httpStatus"
import { db } from "../../src/db/mongo"
import { e2eSeeder } from "../helpers/seeders"

describe("users recovery password", () => {

    beforeAll(async () => {
        await db.run("test")
        await db.drop()
    })

    afterAll(async () => {
        await db.stop()
    })

    afterEach(async () => {
        await db.drop()
    })

    it("POST -> \"auth/password-recovery\": should send email with recovery code; status 204 (not existent user)", async () => {
        request(app)
            .post(paths.auth.passwordRecovery)
            .send({ email: "example@example.com" })
            .expect(HttpStatus.NoContent)
    })

    it("POST -> \"auth/password-recovery\": should send email with recovery code; status 204", async () => {
        const user = await e2eSeeder.createAndLoginUser()

        request(app)
            .post(paths.auth.passwordRecovery)
            .send({ email: user.email })
            .expect(HttpStatus.NoContent)
    })

})
