export type SessionContextType = {
    children: JSX.Element
}


export type VerificationDataType = {
    token: string
    signature: string,
    email: string
}

export type SessionPropsType = {
    save: (key: string, value: string) => void
    get: (key: string) => Promise<any>
    onLogin: ({ email, password }: { email: string, password: string }) => void
    onLogout: () => void
    sendVerificationCode: (to: string) => any
    setVerificationCode: (to: string) => any
    setVerificationData: (token: VerificationDataType) => any
    setInvalidCredentials: (value: boolean) => void
    invalidCredentials: boolean
    verificationData: VerificationDataType
    verificationCode: string
    jwt: string
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

    address: Address
    setAddress: (value: Address) => void
    
    userAgreement: boolean
    setUserAgreement: (value: boolean) => void

    resetAllStates: () => void
}