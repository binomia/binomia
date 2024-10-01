import { AccountModel, UsersModel, kycModel, TransactionsModel, CardsModel } from '@/models'
import { Op } from 'sequelize'
import { getQueryResponseFields, checkForProtectedRequests } from '@/helpers'
import { ZERO_ENCRYPTION_KEY } from '@/constants'
import { GraphQLError } from 'graphql';
import { UserJoiSchema } from '@/joi';
import { UserModelType, VerificationDataType } from '@/types';
import { Request, Response } from "express"
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { Cryptography } from '@/helpers/cryptography';
import { authServer } from '@/rpc';

export class UsersController {
    static users = async (_: unknown, { page, pageSize }: { page: number, pageSize: number }, context: any, { fieldNodes }: { fieldNodes: any }) => {
        try {
            await checkForProtectedRequests(context.req);
            const fields = getQueryResponseFields(fieldNodes, 'users', false, true)

            const _pageSize = pageSize > 50 ? 50 : pageSize
            const offset = (page - 1) * _pageSize;
            const limit = _pageSize;

            const users = await UsersModel.findAll({
                limit,
                offset,
                include: [
                    {
                        model: CardsModel,
                        as: 'card',
                    },
                    {
                        model: AccountModel,
                        as: 'account',
                        attributes: fields['account']
                    },
                    {
                        model: TransactionsModel,
                        limit,
                        order: [['createdAt', 'DESC']],
                        as: 'incomingTransactions',
                        isMultiAssociation: true
                    },
                    {
                        model: TransactionsModel,
                        limit,
                        order: [['createdAt', 'DESC']],
                        as: 'outgoingTransactions',

                    }
                ]
            })



            const response: any[] = users.map((user: any) => {
                console.log(user.dataValues.cards);

                const txs = user.dataValues.incomingTransactions.concat(user.dataValues.outgoingTransactions)
                return Object.assign({}, user.dataValues, {
                    transactions: txs
                })
            })

            return response

        } catch (error: any) {
            throw new GraphQLError(error.message);
        }
    }

    static user = async (_: unknown, ___: any, context: any, { fieldNodes }: { fieldNodes: any }) => {
        try {
            await checkForProtectedRequests(context.req);
            const fields = getQueryResponseFields(fieldNodes, 'user')

            const user = await UsersModel.findOne({
                where: {
                    id: context.req.jwtData.userId
                },
                attributes: fields['user'],
                include: [
                    {
                        model: CardsModel,
                        as: 'card'
                    },
                    {
                        model: AccountModel,
                        as: 'account',
                        attributes: fields['account'],
                        include: [
                            {
                                model: TransactionsModel,
                                limit: 10,
                                order: [['createdAt', 'DESC']],
                                as: 'incomingTransactions',
                                attributes: fields['transactions']
                            },
                            {
                                model: TransactionsModel,
                                limit: 10,
                                order: [['createdAt', 'DESC']],
                                as: 'outgoingTransactions',
                                attributes: fields['transactions']
                            }
                        ]
                    }
                ]
            })

            if (!user) return null

            const incomingTransactions = user.dataValues.account.dataValues.incomingTransactions
            const outgoingTransactions = user.dataValues.account.dataValues.outgoingTransactions

            const transactions = incomingTransactions.concat(outgoingTransactions)

            const account = user.dataValues.account.dataValues
            account.transactions = transactions

            const cardEncrypted = user.dataValues.card.dataValues
            const decryptedCardData = await Cryptography.decrypt(cardEncrypted.data)
            const card = Object.assign({}, cardEncrypted, JSON.parse(decryptedCardData))

            if (card.data)
                delete card.data

            return Object.assign({}, user.dataValues, {
                account,
                card
            })

        } catch (error: any) {
            throw new GraphQLError(error.message);
        }
    }

    static userByEmail = async (_: unknown, { email }: { email: string }) => {
        try {
            const user = await UsersModel.findOne({
                where: {
                    email
                },
                attributes: ["id"]
            })

            return Boolean(user)

        } catch (error: any) {
            throw new GraphQLError(error.message);
        }
    }

    static updateUserPassword = async (_: unknown, { email, password, data }: { email: string, password: string, data: VerificationDataType }) => {
        try {
            const validatedData = await UserJoiSchema.updateUserPassword.parseAsync({ email, password })
            const user = await UsersModel.findOne({
                where: {
                    email
                },
                attributes: ["id"]
            })

            if (!user) {
                throw new GraphQLError('User not found')
            }

            const verify = await authServer('verifyData', data)

            if (!verify) {
                throw new GraphQLError('Invalid token or signature')
            }

            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(validatedData.password, salt);

            const updatedUser = await user.update({
                password: hashedPassword
            })

            return updatedUser.reload()

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

    static createUser = async (_: unknown, { data }: { data: any }, { __, req }: { __: any, req: any }) => {
        try {
            const validatedData = await UserJoiSchema.createUser.parseAsync(data)
            const regexPattern = new RegExp('^\\d{3}-\\d{7}-\\d{1}');
            
            if (!regexPattern.test(validatedData.dniNumber))
                throw new GraphQLError('Invalid `dni` format');
            
            
            const userExists = await UsersModel.findOne({
                where: {
                    [Op.or]: [
                        { email: validatedData.email },
                        { username: validatedData.username }
                    ]
                },
                attributes: ["email", "username", "dniNumber"]
            })
            
            if (userExists?.dataValues.dniNumber === validatedData.dniNumber)
                throw new GraphQLError('A user with dni: ' + validatedData.dniNumber + ' already exists');
            
            if (userExists?.dataValues.email === validatedData.email)
                throw new GraphQLError('A user with email: ' + validatedData.email + ' already exists');

            if (userExists?.dataValues.username === validatedData.username)
                throw new GraphQLError('A user with username: ' + validatedData.username + ' already exists');
            

            const kycExists = await kycModel.findOne({
                where: {
                    dniNumber: validatedData.dniNumber
                }
            })

            if (kycExists)
                throw new GraphQLError('The dni: ' + validatedData.dniNumber + ' already belong to a existing user');

            

            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(validatedData.password, salt);

            const user = await UsersModel.create(Object.assign({}, validatedData, {
                password: hashedPassword
            }))

            const account = await AccountModel.create({
                userId: user.dataValues.id,
                currency: "DOP",
            })

            const kycStatus = "validated"

            
            const kyc = await kycModel.create({
                userId: user.dataValues.id,
                dniNumber: validatedData.dniNumber,
                dob: validatedData.dob,
                status: kycStatus,
                expiration: validatedData.dniExpiration,
                occupation: validatedData.occupation,
                gender: validatedData.gender,
                maritalStatus: validatedData.maritalStatus,
                bloodType: validatedData.bloodType
            })

            const token = jwt.sign({
                userId: user.dataValues.id,
                sid: req.session.id
            }, ZERO_ENCRYPTION_KEY);

            return {
                ...user.dataValues,
                accounts: [account],
                kyc: kyc.dataValues,
                token
            }

        } catch (error: any) {
            throw new GraphQLError(error.message);
        }
    }

    static login = async (_: unknown, { email, password }: { email: string, password: string }, { res, req }: { res: any, req: any }) => {
        try {
            const validatedData = await UserJoiSchema.login.parseAsync({ email, password })

            const user = await UsersModel.findOne({
                where: { email }
            })

            if (!user)
                throw new GraphQLError(`Not found user with email: ${validatedData.email}`);

            const isMatch = await bcrypt.compare(password, user.dataValues.password);
            if (!isMatch)
                throw new GraphQLError('Incorrect password');

            // Generate a JWT
            const token = jwt.sign({
                userId: user.dataValues.id,
                sid: req.session.id
            }, ZERO_ENCRYPTION_KEY);



            req.session.jwt = token
            req.session.userId = user.dataValues.id

            console.log(req.session);

            return token

        } catch (error: any) {
            throw new GraphQLError(error.message);
        }
    }
}