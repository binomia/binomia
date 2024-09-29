import { AccountModelType } from "./accountTypes";
import { CardModelType } from "./cardTypes";
import { SessionModelType } from "./sessionTypes";
import { UserModelType } from "./userTypes";
import { TransactionModelType,TransactionCreateType, TransactionAuthorizationType } from "./transactionTypes";


type CurrencyType = "DOP" | "USD" | "EUR"

export type VerificationDataType = {
    token: string
    signature: string,
}

export type EmailMessageType = {
    subject: string
    message: string
    html: string
}


export {
    UserModelType,
    AccountModelType,
    TransactionModelType,
    TransactionCreateType,
    TransactionAuthorizationType,
    CardModelType,
    SessionModelType,
    CurrencyType
}