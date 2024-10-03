import { z } from 'zod'

export class UserAuthSchema {
    static userProfileData = z.object({
        id: z.number(),
        fullName: z.string(),
        username: z.string(),
        phone: z.string().length(10),
        email: z.string().email(),
        profileImageUrl: z.string().url().optional().nullable().default(null),
        addressAgreementSigned: z.boolean().default(false),
        userAgreementSigned: z.boolean().default(false),
        idFrontUrl: z.string().url(),
        idBackUrl: z.string().url(),
        faceVideoUrl: z.string().url(),
        address: z.string(),
    }).nullable().default(null)

    static kycData = z.object({
        dniNumber: z.string().regex(/^[0-9]{3}-[0-9]{7}-[0-9]{1}$/),
        dob: z.string(),
        dniExpiration: z.string(),
        occupation: z.string().optional().nullable().default(null),
        gender: z.string().optional().nullable().default(null),
        maritalStatus: z.string().optional().nullable().default(null),
        bloodType: z.string().optional().nullable().default(null)
    }).nullable().default(null)

    static createUser = z.object({
        fullName: z.string(),
        username: z.string(),
        phone: z.string().length(10),
        email: z.string().email(),
        password: z.string().min(6),
        profileImageUrl: z.string().url().optional().nullable().default(null),
        addressAgreementSigned: z.boolean().default(false),
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