import { checkForProtectedRequests, getQueryResponseFields } from '@/helpers'
import { CardsModel, UsersModel } from '@/models'
import { Cryptography, } from '@/helpers/cryptography'
import { GraphQLError } from 'graphql';
import { CardModelType } from '@/types';
import { CardAuthSchema } from '@/auth';
import { Op } from 'sequelize';
import cardValidator from 'card-validator';

export class CardsController {
    static card = async (_: unknown, __: unknown, { req }: { req: any }, { fieldNodes }: { fieldNodes: any }) => {
        try {
            const session = await checkForProtectedRequests(req);

            const fields = getQueryResponseFields(fieldNodes, 'card', false, true)
            const card = await CardsModel.findOne({
                where: { userId: session.userId },
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

    static cards = async (_: unknown, __: unknown, { req }: { req: any }, { fieldNodes }: { fieldNodes: any }) => {
        try {
            const session = await checkForProtectedRequests(req);

            const fields = getQueryResponseFields(fieldNodes, 'cards', false, true)
            const cards = await CardsModel.findAll({
                where: { userId: session.userId },
                attributes: fields['cards'],
                include: [{
                    model: UsersModel,
                    as: 'user',
                    attributes: fields['user']
                }]
            })

            return cards

        } catch (error: any) {
            throw new GraphQLError(error);
        }
    }

    static createCard = async (_: unknown, { data }: { data: CardModelType }, { req }: { req: any }, { fieldNodes }: { fieldNodes: any }) => {
        try {
            const session = await checkForProtectedRequests(req);
            const validatedData: CardModelType = await CardAuthSchema.createCard.parseAsync(data)

            // if (!IS_VALID_CARD_LENGTH(validatedData.cardNumber))
            //     throw new GraphQLError('Card inserted is not valid');

            const hash = await Cryptography.hash(validatedData.cardNumber)
            const cardExist = await CardsModel.findOne({
                where: {
                    [Op.and]: [
                        { hash },
                        { userId: session.userId }
                    ]
                }
            })

            if (cardExist)
                throw new GraphQLError('Tarjeta ya esta vinculada');

            const encryptedCardData = await Cryptography.encrypt(JSON.stringify(validatedData))

            if (validatedData.isPrimary)
                await CardsModel.update({ isPrimary: false }, {
                    where: {
                        userId: session.userId
                    }
                })

            const cardValidated = cardValidator.number(validatedData.cardNumber)
            const card = await CardsModel.create({
                brand: cardValidated.card?.type ?? 'unknown',
                alias: validatedData.alias,
                last4Number: validatedData.cardNumber.slice(-4),
                isPrimary: validatedData.isPrimary,
                hash,
                data: encryptedCardData,
                userId: session.userId
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
            const session = await checkForProtectedRequests(req);
            const validatedData: CardModelType = await CardAuthSchema.createCard.parseAsync(data)
            const fields = getQueryResponseFields(fieldNodes, 'card')

            const card = await CardsModel.findOne({
                where: {
                    userId: session.userId
                }
            })
            if (!card)
                throw new GraphQLError('The given user does not have a card linked');


            const encryptedCardData = await Cryptography.encrypt(JSON.stringify(validatedData))
            await card.update({
                data: encryptedCardData
            }, {
                where: {
                    userId: session.userId
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

    static deleteCard = async (_: unknown, { hash }: { hash: string }, { req }: { req: any }, { fieldNodes }: { fieldNodes: any }) => {
        try {
            const session = await checkForProtectedRequests(req);
            const card = await CardsModel.findOne({
                where: {
                    [Op.and]: [
                        { userId: session.userId },
                        { hash }
                    ]
                }
            })

            if (!card)
                throw new GraphQLError('Tarjeta no vinculada');

            await card.destroy()
            return card.toJSON()

        } catch (error: any) {
            throw new GraphQLError(error);
        }
    }
}