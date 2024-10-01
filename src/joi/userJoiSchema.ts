import { z } from 'zod'


// {
//     "faceVideoUrl": "https://res.cloudinary.com/brayhandeaza/video/upload/v1727661924/dinero/video/1727661920886.mp4",
//     "fullName": "Rosa elena Victoriano severino",
//     "phone": "8496352186",
//     "username": "224-0082268-4",
//     "email": "lpmrloki@gmail.com",
//     "dni": "224-0082268-4",
//     "sex": "m" -> gender,
//     "address": "Villa",
//     "dob": "1989-12-11",
//     "dniExpiration": "2024-12-11",
//     "imageUrl": "" -> profileImageUrl,
//     "password": "123456",
//     "addressAgreement": true,
//     "userAgreement": true,
//     "idBackUrl": "https://res.cloudinary.com/brayhandeaza/image/upload/v1727661902/dinero/cedulas/1727661901878.jpg",
//     "idFrontUrl": "https://res.cloudinary.com/brayhandeaza/image/upload/v1727661868/dinero/cedulas/1727661866948.jpg"
//   }

export class UserJoiSchema {
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
