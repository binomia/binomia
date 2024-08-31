import Joi from 'joi'


export class CardJoiSchema {
    static cresteCard = Joi.object({
        cardNumber: Joi.string().length(16).required(),
        cvv: Joi.string().min(3).max(4).required(),
        expirationDate: Joi.date().required(),
        cardHolderName: Joi.string().required()
    })
}
