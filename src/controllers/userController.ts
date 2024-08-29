import { UsersModel } from '../models'
import { Op } from 'sequelize'
import { getQueryResponseFields, formatCedula } from '../helpers'
import { GraphQLError } from 'graphql';
import { UserJoiSchema } from '../joi';
import { UserModelType } from '../types';
import { Request, Response } from "express"


export class UsersController {
    static users = async (_: unknown, { page, pageSize }: { page: number, pageSize: number }, _context: any, { fieldNodes }: { fieldNodes: any }) => {
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
            throw new GraphQLError(error.message);
        }
    }


    static user = async (_: unknown, { dni }: { dni: string }, __: any, { fieldNodes }: { fieldNodes: any }) => {
        try {
            const fields = getQueryResponseFields(fieldNodes, 'user', false, true)
            const user = await UsersModel.findOne({
                where: {
                    dni
                },
                attributes: fields['user']
            })

            return user

        } catch (error: any) {
            throw new GraphQLError(error.message);
        }
    }


    static searchUsers = async (_: any, { search, limit }: { search: UserModelType, limit: number }, __: any, { fieldNodes }: { fieldNodes: any }) => {
        try {
            const fields = getQueryResponseFields(fieldNodes, "users")

            const searchFilter = []
            for (const [key, value] of Object.entries(search)) {
                if (value) {
                    searchFilter.push({ [key]: { [Op.like]: `%${value}%` } }) // change like to ilike for postgres
                }
            }

            const users = await UsersModel.findAll({
                limit,
                attributes: fields['users'],
                where: {
                    [Op.or]: searchFilter
                }
            })

            return users

        } catch (error: any) {
            throw new GraphQLError(error.message);
        }
    }

    static createUser = async (_: unknown, { data }: { data: any }, { res, req }: { res: Response, req: Request }) => {
        try {
            const validatedData: UserModelType = await UserJoiSchema.createUser.validateAsync(data)
            const regexPattern = new RegExp('^\\d{3}-\\d{7}-\\d{1}');

            if (!regexPattern.test(validatedData.dni))
                throw new GraphQLError('Invalid `dni` format');


            const userExists = await UsersModel.findOne({
                where: {
                    [Op.or]: [{ dni: validatedData.dni }, { email: validatedData.email }]
                },
                attributes: ['dni', "email"]
            })

            if (userExists?.dataValues.dni === validatedData.dni)
                throw new GraphQLError(`A user with dni: ${validatedData.dni} already exists`);

            else if (userExists?.dataValues.email === validatedData.email)
                throw new GraphQLError('A user with email: ' + validatedData.email + ' already exists');

            const user = await UsersModel.create(validatedData)
            return user

        } catch (error: any) {
            throw new GraphQLError(error.message);
        }
    }
}