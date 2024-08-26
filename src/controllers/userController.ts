import { UsersModel } from '../models'
import { Op } from 'sequelize'
import { getQueryResponseFields, formatCedula } from '../helpers'
import { ApolloServerErrorCode } from '@apollo/server/errors'
import { GraphQLError } from 'graphql';

export class UsersController {
    static users = async (_: unknown, { page, pageSize }: { page: number, pageSize: number }, __: any, { fieldNodes }: { fieldNodes: any }) => {
        try {
            const fields = getQueryResponseFields(fieldNodes, 'users', false, true)
            const _pageSize = pageSize > 50 ? 50 : pageSize
            const offset = (page - 1) * _pageSize;
            const limit = _pageSize;

            const users = await UsersModel.findAll({
                limit,
                offset,
                attributes: fields['users'],
            })

            return users

        } catch (error: any) {
            throw new GraphQLError(error);
        }
    }


    static user = async (_: unknown, { uuid }: { uuid: string }, __: any, { fieldNodes }: { fieldNodes: any }) => {
        try {
            const fields = getQueryResponseFields(fieldNodes, 'user', false, true)
            const user = await UsersModel.findOne({
                where: {
                    uuid
                },
                attributes: fields['user']
            })
            return {
                error: false,
                message: user ? 'user found successfully' : 'not user found',
                data: user
            }
        } catch (error: any) {
            return {
                error: true,
                message: error.toString(),
                data: null
            }
        }
    }

}