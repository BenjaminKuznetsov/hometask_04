import { jwtService } from "../../src/common/adapters/jwt.service"
import { ResultStatus } from "../../src/common/result/result.type"

describe("jwt token", () => {
    const createAccessTokenUseCase = jwtService.createAccessToken
    const verifyTokenUseCase = jwtService.verifyToken
    const userId = "3742126b-00cf-4e08-9b79-8947fc8811c4"

    it("should verify valid access token", async () => {
        const token = await createAccessTokenUseCase(userId)
        expect(token).toStrictEqual(expect.any(String))
        const result = await verifyTokenUseCase(token)
        expect(result.status).toBe(ResultStatus.Success)
        expect(result.data).toStrictEqual({ userId, iat: expect.any(Number), exp: expect.any(Number) })
    })

    it("shouldn`t verify expired access token", async () => {
        const token = await createAccessTokenUseCase(userId)
        expect(token).toStrictEqual(expect.any(String))

        setTimeout(async () => {
            const result = await verifyTokenUseCase(token)
            expect(result.status).toBe(ResultStatus.Unauthorized)
        }, 15000)
    })
})