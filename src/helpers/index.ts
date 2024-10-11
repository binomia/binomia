import { ZERO_ENCRYPTION_KEY } from '@/constants';
import { AccountModel, CardsModel, SessionModel, UsersModel } from '@/models';
import KYCModel from '@/models/kycModel';
import bcrypt from 'bcryptjs';
import { GraphQLError } from 'graphql';
import jwt from 'jsonwebtoken';
import { STRING } from 'sequelize';
import { z } from 'zod'


const getGqlBody = (fieldNodes: any[], schema: string) => {
    let body: any = {
        [schema]: []
    }

    const gqlSchemas = [
        "user",
        "kyc",
        "users",
        "account",
        "accounts",
        "card",
        "cards",
        "receiver",
        "sender",
        "to",
        "from",
        "transactions",
        "transaction"
    ];

    fieldNodes.forEach((item: any) => {
        if (item.kind === 'Field') {
            if (!gqlSchemas.includes(item.name.value)) {
                if (item.name.value !== "__typename") {
                    body[schema].push(item.name.value)
                }
            } else {
                const items = getGqlBody(item.selectionSet.selections, item.name.value)
                body = Object.assign(body, items)
            }
        }
    })

    return body
}

export const getQueryResponseFields = (fieldNodes: any[], name: string, isGlobal: boolean = false, isAll: boolean = false) => {
    const selections = fieldNodes[0].selectionSet?.selections;
    const fields = getGqlBody(selections, name)

    return fields
}

export const addFutureDate = (day: number = 30): number => {
    const currentDate = new Date();
    const futureDate = new Date(currentDate.setDate(currentDate.getDate() + day));
    return futureDate.getTime();
}

export const hashPassword = (password: string): Promise<string> => {
    const saltRounds = 10;
    const hashedPassword = bcrypt.hash(password, saltRounds);
    return hashedPassword;
}

export const comparePassword = async (password: string, hashedPassword: string): Promise<boolean> => {
    const isMatch = bcrypt.compareSync(password, hashedPassword)
    return isMatch
}

export const formatCedula = (value: string): string => {
    if (value.length <= 3 && value !== "") {
        return value.replaceAll("-", "")
    }
    else if (value.length > 3 && value.length <= 10) {
        const formattedValue = value.slice(0, 3) + "-" + value.slice(3)
        return formattedValue
    }
    else if (value.length > 10 && value.length <= 11) {
        const formattedValue = value.slice(0, 3) + "-" + value.slice(3, 10) + "-" + value.slice(10, 11);
        return formattedValue
    }
    return value
}

export const generateUUID = (): string => {
    const inputString = Date.now().toString().slice(1, 12)

    if (inputString.length === 11) {
        const formattedString =
            inputString[0] +
            "-" +
            inputString.slice(0, 3) +
            "-" +
            inputString.slice(3, 10) +
            "-" +
            inputString.slice(10);

        return formattedString.toString();

    } else {
        return inputString.toString();
        // throw new Error("Invalid input string length");
    }
}


export const checkForProtectedRequests = async (req: any) => {
    try {
        const sessionAuthIdentifier = await z.string().length(64).transform((val) => val.trim()).parseAsync(req.headers["session-auth-identifier"]);
        const token = await z.string().min(1).transform((val) => val.trim()).parseAsync(req.headers["authorization"]);
        const jwtToken = token.split(' ')[1];

        const jwtVerifyAsync = new Promise((resolve, reject) => {
            jwt.verify(jwtToken, ZERO_ENCRYPTION_KEY, (err, payload) => {
                if (err)
                    reject(err);
                else
                    resolve(payload);
            });
        });


        await jwtVerifyAsync.then(async (data: any) => {
            const jwtData = await z.object({
                sid: z.string().min(1).transform((val) => val.trim())
            }).parseAsync(data);


            const session = await SessionModel.findOne({
                where: {
                    sid: jwtData.sid,
                },
                include: [{
                    model: UsersModel,
                    as: 'user',
                    include: [
                        {
                            model: AccountModel,
                            as: 'account'
                        },
                        {
                            model: CardsModel,
                            as: 'cards'
                        },
                        {
                            model: KYCModel,
                            as: 'kyc'
                        }
                    ]
                }]
            })

            if (!session)
                throw new GraphQLError("INVALID_SESSION: No session found")

            // console.log(session.toJSON());


            if (jwtToken !== session.dataValues.jwt || sessionAuthIdentifier !== session.dataValues.deviceId)
                throw new Error("INVALID_SESSION: Invalid token data")

            else
                req.session = session.toJSON()

        }).catch((error: any) => {
            const message = error.message === "jwt expired" ? "INVALID_SESSION: Session expired" : error.message
            throw new GraphQLError(message, {
                extensions: {
                    code: "INVALID_SESSION",
                    http: {
                        status: 500
                    }
                }
            })
        })

    } catch (error: any) {
        throw error
    }
}


export const GET_LAST_SUNDAY_DATE = (): Date => {
    const now: Date = new Date();
    const dayOfWeek = now.getDay();
    const daysSinceLastSunday = dayOfWeek === 0 ? 7 : dayOfWeek;

    const lastSunday = new Date(now);
    lastSunday.setDate(now.getDate() - daysSinceLastSunday);
    lastSunday.setHours(0, 0, 0, 1);

    return lastSunday;
}
