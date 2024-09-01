import { CardsModel, UsersModel } from '@/models'
import { checkForProtectedRequests, getQueryResponseFields, } from '@/helpers'
import { Cryptography, } from '@/helpers/cryptography'
import { GraphQLError } from 'graphql';
import { CardModelType } from '@/types';
import { CardJoiSchema } from '@/joi';
import { errorCode } from '@/errors';

export class CardsController {
    static createCard = async (_: unknown, { data }: { data: CardModelType }, { req }: { req: any }, { fieldNodes }: { fieldNodes: any }) => {
        try {
            await checkForProtectedRequests(req);
            const validatedData: CardModelType = await CardJoiSchema.cresteCard.validateAsync(data)

            const cardExist = await CardsModel.findOne({ where: { userId: req.jwtData.userId } })
            if (cardExist)
                throw new GraphQLError('The given user already has a card linked');

            const encryptedCardDataData = await Cryptography.encrypt(JSON.stringify(validatedData))
            const card = await CardsModel.create({
                data: encryptedCardDataData,
                userId: req.jwtData.userId
            })


            const fields = getQueryResponseFields(fieldNodes, 'card', false, true)
            console.log({fields});
            

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