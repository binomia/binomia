import { CardsModel, UsersModel } from '@/models'
import { checkForProtectedRequests, getQueryResponseFields, } from '@/helpers'
import { Cryptography, } from '@/helpers/cryptography'
import { GraphQLError } from 'graphql';
import { CardModelType } from '@/types';
import { CardJoiSchema } from '@/joi';

export class CardsController {
    static card = async (_: unknown, { page, pageSize }: { page: number, pageSize: number }, { req }: { req: any }, { fieldNodes }: { fieldNodes: any }) => {
        try {
            await checkForProtectedRequests(req);
            
            const fields = getQueryResponseFields(fieldNodes, 'card', false, true)
            const card = await CardsModel.findOne({
                where: { userId: req.jwtData.userId },
                include: [{
                    model: UsersModel,
                    as: 'user',
                    attributes: fields['user']
                }]
            })

            if (!card)
                throw new GraphQLError('The given user does not have a card linked');


            const decryptedCardData = await Cryptography.decrypt(card?.dataValues?.data)
            const cardData = Object.assign({}, card.dataValues, JSON.parse(decryptedCardData))

            return cardData

        } catch (error: any) {
            throw new GraphQLError(error);
        }
    }


    static createCard = async (_: unknown, { data }: { data: CardModelType }, { req }: { req: any }, { fieldNodes }: { fieldNodes: any }) => {
        try {
            await checkForProtectedRequests(req);
            const validatedData: CardModelType = await CardJoiSchema.cresteCard.validateAsync(data)

            const cardExist = await CardsModel.findOne({ where: { userId: req.jwtData.userId } })
            if (cardExist)
                throw new GraphQLError('The given user already has a card linked');

            const encryptedCardData = await Cryptography.encrypt(JSON.stringify(validatedData))
            const card = await CardsModel.create({
                data: encryptedCardData,
                userId: req.jwtData.userId
            })


            const fields = getQueryResponseFields(fieldNodes, 'card')
            const cardData = await card.reload({
                attributes: fields['card'],
                include: [{
                    model: UsersModel,
                    as: 'user',
                    attributes: fields['user']
                }]
            })

            return cardData

        } catch (error: any) {
            throw new GraphQLError(error);
        }
    }


    static updateCard = async (_: unknown, { data }: { data: CardModelType }, { req }: { req: any }, { fieldNodes }: { fieldNodes: any }) => {
        try {
            await checkForProtectedRequests(req);
            const validatedData: CardModelType = await CardJoiSchema.cresteCard.validateAsync(data)
            const fields = getQueryResponseFields(fieldNodes, 'card')

            const card = await CardsModel.findOne({
                where: {
                    userId: req.jwtData.userId
                }
            })
            if (!card)
                throw new GraphQLError('The given user does not have a card linked');


            const encryptedCardData = await Cryptography.encrypt(JSON.stringify(validatedData))
            await card.update({
                data: encryptedCardData
            }, {
                where: {
                    userId: req.jwtData.userId
                }
            })

            const cardData = await card.reload({
                attributes: fields['card'],
                include: [{
                    model: UsersModel,
                    as: 'user',
                    attributes: fields['user']
                }]
            })

            return cardData

        } catch (error: any) {
            throw new GraphQLError(error);
        }
    }

}