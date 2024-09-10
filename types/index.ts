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