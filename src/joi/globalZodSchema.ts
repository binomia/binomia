import Joi from 'joi'
import { z } from 'zod'


export class GlobalZodSchema {
    static cresteCard = Joi.object({
        cardNumber: Joi.string().length(16).required(),
        cvv: Joi.string().min(3).max(4).required(),
        expirationDate: Joi.date().required(),
        cardHolderName: Joi.string().required()
    })

    static header = z.object({
        "session-auth-identifier": z.string().length(64, 'base64').transform((val) => val.trim()),
        authorization: z.string(),
        device: z.object({}).passthrough().optional().default({}),
    })
    static registerHeader = z.object({
        "session-auth-identifier": z.string().length(64, 'base64').transform((val) => val.trim()),
        device: z.string(),
    })
}
