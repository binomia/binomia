import Joi from 'joi'


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
}
