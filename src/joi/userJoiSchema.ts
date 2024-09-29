import Joi from 'joi'
import { z } from 'zod'




export class UserJoiSchema {
    static createUser = Joi.object({
        fullName: Joi.string().required(),
        username: Joi.string().required(),
        phone: Joi.string().required(),
        email: Joi.string().email().required(),
        password: Joi.string().min(6).required(),
        profileImageUrl: Joi.string().optional().allow(null),
        addressAgreementSigned: Joi.boolean().required(),
        userAgreementSigned: Joi.boolean().required(),
        idFrontUrl: Joi.string().required(),
        idBackUrl: Joi.string().required(),
        faceVideoUrl: Joi.string().required(),
        address: Joi.string().required(),

        dniNumber: Joi.string().regex(/^[0-9]{3}-[0-9]{7}-[0-9]{1}$/).required(),
        dob: Joi.date().required(),
        dniExpiration: Joi.date().required(),
        occupation: Joi.string().optional().allow(null),
        gender: Joi.string().optional().allow(null),
        maritalStatus: Joi.string().optional().allow(null),
        bloodType: Joi.string().optional().allow(null)
    })

    static _createUser = z.object({
        fullName: z.string(),
        username: z.string(),
        phone: z.string().length(10),
        email: z.string().email(),
        password: z.string().min(6),
        profileImageUrl: z.string().url().optional().nullable(),
        addressAgreementSigned: z.boolean().default(false),
        userAgreementSigned: z.boolean().default(false),
        idFrontUrl: z.string().url(),
        idBackUrl: z.string().url(),
        faceVideoUrl: z.string().url(),
        address: z.string(),

        dniNumber: z.string().regex(/^[0-9]{3}-[0-9]{7}-[0-9]{1}$/),
        dob: z.string(),
        dniExpiration: z.string(),
        occupation: z.string().optional().nullable(),
        gender: z.string().optional().nullable(),
        maritalStatus: z.string().optional().nullable(),
        bloodType: z.string().optional().nullable()
    })

    static login = Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().min(6).required()
    })

    static updateUserPassword = Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().min(6).required()
    })
}
