export type SessionContextType = {
    children: JSX.Element
}

export type SessionPropsType = {
    onLogin: ({ email, password }: { email: string, password: string }) => void
    onLogout: () => void
    jwt: string
}