import "express"

declare global {
    namespace Express {
        export interface Request {
            userCtx: {
                userId: string | null
                deviceId?: string
            }
        }
    }
}
