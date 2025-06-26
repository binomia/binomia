import { AccountAuthSchema } from "@/auth/accountAuth";
import { TransactionAuthSchema } from "@/auth/transactionAuth";
import { UserAuthSchema } from "@/auth/userAuth"
import z from "zod";
import * as Notifications from 'expo-notifications';
import { TopUpAuthSchema } from "@/auth/topUpAuth";
import { SessionAuthSchema } from "@/auth/sessionAuth";


export type SessionContextType = {
    children: JSX.Element
}


export type CardType = {
    id: number
    last4Number: string
    hash: string
    brand: string
    alias: string
    data: string
    createdAt: string
    updatedAt: string
}


export type VerificationDataType = {
    token: string
    signature: string,
    email: string
}
export type SessionVerificationDataType = {
    token: string
    sid: string
    signature: string,
    code: string
}

export type CreateUserDataType = z.infer<typeof UserAuthSchema.createUser>

export type SessionPropsType = {
    onLogin: ({ email, password }: { email: string, password: string }) => Promise<any>
    onRegister: (data: CreateUserDataType) => Promise<any>,
    onLogout: () => void
    sendVerificationCode: (to: string) => any
    setVerificationCode: (to: string) => any
    setVerificationData: (token: VerificationDataType) => any
    setSessionVerificationData: (token: z.infer<typeof SessionAuthSchema.verifySession>) => any
    setInvalidCredentials: (value: boolean) => void
    fetchSessionUser: () => Promise<void>
    invalidCredentials: boolean
    verificationData: VerificationDataType
    sessionVerificationData: z.infer<typeof SessionAuthSchema.verifySession>
    verificationCode: string
    jwt: string
    applicationId: string
}


export type SecureStoreType = {
    save: (key: string, value: string) => void
    get: (key: string) => Promise<any>
}


export type Address = {
    street: string
    number: number
    city: string
    province: string
    municipality: string
}

export type TopUpContextType = {
    amount: number
    setAmount: (value: number) => void
    phoneNumber: string
    setPhoneNumber: (value: string) => void
    fullName: string
    setFullName: (value: string) => void
    company: z.infer<typeof TopUpAuthSchema.company>
    setCompany: (value: any) => void
}


export type GlobalContextType = {
    email: string
    setEmail: (value: string) => void

    password: string
    setPassword: (value: string) => void

    names: string
    setNames: (value: string) => void

    lastNames: string
    setLastNames: (value: string) => void

    phoneNumber: string
    setPhoneNumber: (value: string) => void

    idFront: string
    setIdFront: (value: string) => void

    idBack: string
    setIdBack: (value: string) => void

    address: string
    setAddress: (value: string) => void

    userAgreement: boolean
    setUserAgreement: (value: boolean) => void

    addressAgreement: boolean
    setAddressAgreement: (value: boolean) => void

    showCloseButton: boolean
    setShowCloseButton: (value: boolean) => void

    dni: string
    setDNI: (value: string) => void

    dniExpiration: string
    setDNIExpiration: (value: string) => void

    dniDOB: string
    setDNIDOB: (value: string) => void

    resetAllStates: () => void
}

export type FormatTransactionType = {
    isFromMe: boolean
    profileImageUrl?: string
    amount: number
    fullName?: string
    username?: string
}

export type SocketContextType = {
    emit: (event: string, data: any) => void,
    on: (event: string, callback: (data: any) => void) => void
}


export type PushNotificationType = {
    notification?: Notifications.Notification
    expoPushToken?: string
    registerForPushNotificationsAsync: () => Promise<string | undefined>
}


export type WeeklyQueueTitleType = z.infer<typeof TransactionAuthSchema.weeklyQueueTitle>
export type AccountLimitsType = z.infer<typeof AccountAuthSchema.accountLimits>
export type AccountType = z.infer<typeof AccountAuthSchema.account>

