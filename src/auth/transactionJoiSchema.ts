import Joi from 'joi'
import { z } from 'zod'


export class TransactionJoiSchema {
    static createTransaction = Joi.object({
        amount: Joi.number().greater(0).required(),
        currency: Joi.string().valid('DOP').required(),
        receiver: Joi.string().required(),
        transactionType: Joi.string().required(),
        location: Joi.object({
            latitude: Joi.number().required(),
            longitude: Joi.number().required()
        }).required()
    })

    static recurrenceTransaction = z.object({
        title: z.string(),
        time: z.string()
    })

    static bankingCreateTransaction = TransactionJoiSchema.createTransaction.fork(
        ['receiver'],
        (schema) => schema.forbidden()
    )

    

    static validateTransaction = z.object({
        amount: z.number(),
        currency: z.string(),
        transactionType: z.string(),
        sender: z.object({}).passthrough(),
        receiver: z.object({}).passthrough(),
        location: z.object({
            latitude: z.number(),
            longitude: z.number()
        })
    })
}
