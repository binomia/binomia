import { z } from 'zod'

export class UserAuthSchema {
    static userProfileData = z.object({
        id: z.number(),
        fullName: z.string(),
        signingKey: z.string(),
        username: z.string(),
        dniNumber: z.string(),
        phone: z.string().length(10),
        email: z.string().email(),
        profileImageUrl: z.string().nullish().transform(v => v ?? ""),
        userAgreementSigned: z.boolean().default(false),
        idFrontUrl: z.string().url(),
        idBackUrl: z.string().url(),
        faceVideoUrl: z.string().url(),
        address: z.string(),
    }).partial().nullable().default(null)

    static singleUser = z.object({
        id: z.number(),
        fullName: z.string(),
        username: z.string(),
        email: z.string().email(),
        dniNumber: z.string().regex(/^[0-9]{3}-[0-9]{7}-[0-9]{1}$/),
        phone: z.string().length(10),
        profileImageUrl: z.string().nullish().transform(v => v ?? ""),
        userAgreementSigned: z.boolean().default(false),
        idFrontUrl: z.string().url(),
        idBackUrl: z.string().url(),
        faceVideoUrl: z.string().url(),
        address: z.string(),
        createdAt: z.string(),
        updatedAt: z.string(),
    })

    static singleSearchUserData = z.object({
        id: z.number(),
        fullName: z.string(),
        username: z.string(),
        email: z.string().email(),
        dniNumber: z.string().regex(/^[0-9]{3}-[0-9]{7}-[0-9]{1}$/),
        profileImageUrl: z.string().nullish().transform(v => v ?? ""),
        status: z.string(),
    })

    static cardData = z.object({
        id: z.number(),
        last4Number: z.string(),
        isPrimary: z.boolean(),
        hash: z.string(),
        brand: z.string(),
        alias: z.string(),
        data: z.string(),
        createdAt: z.string(),
        updatedAt: z.string(),
    })

    static cardsData = z.array(UserAuthSchema.cardData).min(0)
    static searchUserData = z.array(UserAuthSchema.singleSearchUserData).min(0)

    static accountsData = z.object({
        id: z.number(),
        balance: z.number(),
        status: z.string(),
        sendLimit: z.number(),
        receiveLimit: z.number(),
        withdrawLimit: z.number(),
        allowWithdraw: z.boolean(),
        allowSend: z.boolean(),
        allowReceive: z.boolean(),
        allowRequestMe: z.boolean(),
        hash: z.string(),
        currency: z.string(),
        createdAt: z.string(),
        updatedAt: z.string(),
    }).nullable().default(null)


    static kycData = z.object({
        id: z.number(),
        dniNumber: z.string().regex(/^[0-9]{3}-[0-9]{7}-[0-9]{1}$/),
        dob: z.string(),
        status: z.string(),
        expiration: z.string(),
        occupation: z.string().optional().nullable().default(null),
        gender: z.string().optional().nullable().default(null),
        maritalStatus: z.string().optional().nullable().default(null),
        bloodType: z.string().optional().nullable().default(null),
        createdAt: z.string(),
        updatedAt: z.string(),
    }).nullable().default(null)


    static createUser = z.object({
        fullName: z.string(),
        username: z.string(),
        phone: z.string().length(10),
        email: z.string().email(),
        password: z.string().min(6),
        profileImageUrl: z.string().nullish().transform(v => v ?? ""),
        allowWhatsappNotification: z.boolean().default(true),
        allowEmailNotification: z.boolean().default(true),
        allowSmsNotification: z.boolean().default(true),
        allowPushNotification: z.boolean().default(true),
        userAgreementSigned: z.boolean().default(false),
        idFrontUrl: z.string().url(),
        idBackUrl: z.string().url(),
        faceVideoUrl: z.string().url(),
        address: z.string(),

        dniNumber: z.string().regex(/^[0-9]{3}-[0-9]{7}-[0-9]{1}$/),
        dob: z.string(),
        dniExpiration: z.string(),
        occupation: z.string().optional().nullable().default(null),
        gender: z.string().optional().nullable().default(null),
        maritalStatus: z.string().optional().nullable().default(null),
        bloodType: z.string().optional().nullable().default(null)
    })


    static login = z.object({
        email: z.string().email(),
        password: z.string().min(6)
    })


    static updateUserPassword = z.object({
        email: z.string().email(),
        password: z.string().min(6)
    })
}