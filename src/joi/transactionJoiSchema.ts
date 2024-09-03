import Joi from 'joi'


export class TransactionJoiSchema {
    static createTransaction = Joi.object({
        amaunt: Joi.number().min(0.01).required(),
        currency: Joi.string().valid('DOP', 'USD').required(),
        description: Joi.string().required(),
        receiverId: Joi.number().required(),
        location: Joi.object({
            latitude: Joi.number().required(),
            longitude: Joi.number().required()
        }).required()
    })
}
