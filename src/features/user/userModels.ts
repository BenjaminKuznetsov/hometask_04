import { HydratedDocument, model, Schema } from "mongoose"
import { Timestamps } from "../../common/types/types"

export type User = {
    login: string
    email: string
    passwordHash: string
    emailConfirmation: TEmailConfirmation
}

export type TEmailConfirmation = {
    confirmationCode?: string // not required if created by admin
    expirationDate?: Date // not required if created by admin
    confirmationStatus: ConfirmationStatus
}

export enum ConfirmationStatus {
    CREATED_BY_ADMIN = 0,
    NOT_CONFIRMED = 1,
    CONFIRMED = 2,
}

export type UserDocument = HydratedDocument<User> & Timestamps

const emailConfirmationSchema = new Schema<TEmailConfirmation>({
    confirmationCode: { type: String },
    expirationDate: { type: Date },
    confirmationStatus: { type: Number, enum: ConfirmationStatus, required: true },
}, {
    timestamps: true,
})

export const userSchema = new Schema<User>({
    login: { type: String, required: true },
    email: { type: String, required: true },
    passwordHash: { type: String, required: true },
    emailConfirmation: emailConfirmationSchema,
}, {
    timestamps: true,
})

export const UserModel = model<User>("users", userSchema)

export type UserDBFilter = {
    login?: string
    email?: string
}

export type UserViewModel = {
    id: string
    login: string
    email: string
    createdAt: string
}

export type MeViewModel = {
    userId: string
    login: string
    email: string
}

export const exampleUserDocument = {
    id: "1",
    login: "string",
    email: "string",
    createdAt: "string",
}

export type UserSearchParams = {
    searchLoginTerm?: string | null
    searchEmailTerm?: string | null
}

export type UserInputModel = {
    login: string
    email: string
    password: string
}