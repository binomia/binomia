import { AccountModel, UsersModel } from '@/models'
import { getQueryResponseFields } from '@/helpers'
import { GraphQLError } from 'graphql';
import { CardModelType } from '@/types';
import { CardJoiSchema } from '@/joi';

export class CardsController {
    static createCard = async (_: unknown, data: any, _context: any, { fieldNodes }: { fieldNodes: any }) => {
        try {
            const validatedData: CardModelType = await CardJoiSchema.cresteCard.validateAsync(data)
          
            return null

        } catch (error: any) {
            throw new GraphQLError(error.message);
        }
    }

}