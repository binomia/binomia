import Joi from 'joi'


export class UserJoiSchema {
    static createUser = Joi.object({
        fullName: Joi.string().required(),
        username: Joi.string().required(),
        email: Joi.string().email().required(),
        dni: Joi.string().regex(/^[0-9]{3}-[0-9]{7}-[0-9]{1}$/).required(),
        sex: Joi.string().required(),
        address: Joi.string().required(),
        dob: Joi.date().required(),
        dniExpiration: Joi.date().required()
    })
}
