import { ZERO_ENCRYPTION_KEY } from '@/constants';
import bcrypt from 'bcryptjs';
import { GraphQLError } from 'graphql';
import jwt from 'jsonwebtoken';


const getGqlBody = (fieldNodes: any[], schema: string) => {
    let body: any = {
        [schema]: []
    }

    const gqlSchemas = [
        "user",
        "users",
        "account",
        "accounts",
        "card",
        "cards",
        "receiver",
        "sender",
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
        const token = req.headers.authorization || '';
        if (!token)
            throw new GraphQLError('Unauthorized access')

        const jwtToken = token.split(' ')[1];
        jwt.verify(jwtToken, ZERO_ENCRYPTION_KEY, (err: any, decoded: any) => {
            if (err)
                throw new GraphQLError("Unauthorized access: " + err)

            else if (decoded.sid !== req.session.id || decoded.userId !== req.session.userId)
                throw new GraphQLError("Unauthorized access")

            else if (jwtToken !== req.session.jwt)
                throw new Error("Unauthorized access")


            req.jwtData = decoded
        })

    } catch (error) {
        throw new GraphQLError("Unauthorized access")
    }
}