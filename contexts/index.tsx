import { createContext, useEffect, useState } from "react";
import { SessionContextType, SessionPropsType } from "@/types";
import { useMutation } from '@apollo/client';
import { SessionApolloQueries } from "@/apollo/query/sessionQuery";
import * as SecureStore from 'expo-secure-store';
import * as Updates from 'expo-updates';
import { notificationServer } from "@/rpc";
import { GENERATE_SIX_DIGIT_TOKEN } from "@/helpers";


export const SessionContext = createContext<SessionPropsType>({
    onLogin: (_: { email: string, password: string }) => { },
    onLogout: () => { },
    sendVerificationCode: (_: string) => { },
    setVerificationCode: (_: string) => { },
    verificationCode: "",
    jwt: "",
});


export const SessionContextProvider = ({ children }: SessionContextType) => {
    const [jwt, setJwt] = useState<string>("");
    const [verificationCode, setVerificationCode] = useState<string>("");


    const sendVerificationCode = async (to: string) => {
        try {
            const code = GENERATE_SIX_DIGIT_TOKEN()
            setVerificationCode(code)

            const message = await notificationServer("sendEmail", {
                to,
                subject: `Codigo De Verificación`,
                text: `Su Codigo De Verificación Es: ${code}`,
                html: `<b>Su Codigo De Verificación Es: ${code}</b>`
            })

            return message

        } catch (error: unknown) {
            console.log({ error });
        }
    }

    const [login] = useMutation(SessionApolloQueries.login(), {
        variables: { email: "test@email.com", password: "password" }
    });

    const save = async (key: string, value: string) => {
        await SecureStore.setItemAsync(key, value);
    }


    const get = async (key: string) => {
        const value = await SecureStore.getItemAsync(key);
        return value
    }


    const remove = async (key: string) => {
        await SecureStore.deleteItemAsync(key);
    }

    const getJWTToken = async (key: string) => {
        const value = await get(key);

        if (value)
            setJwt(value);
    }


    useEffect(() => {
        getJWTToken("jwt");
    }, [])


    const onLogout = async () => {
        try {
            await remove("jwt");
            await Updates.reloadAsync();

        } catch (error) {
            console.log({ error });
        }
    }


    const onLogin = async ({ email, password }: { email: string, password: string }) => {
        try {
            console.log({ email, password });

            const data = await login({
                variables: { email, password }
            });

            if (data.data.login) {
                await save("jwt", data.data.login)
                await Updates.reloadAsync();

                return data.data.login
            }

            return ""
        } catch (error) {
            console.log({ error });
        }
    }


    const value = {
        onLogin,
        onLogout,
        sendVerificationCode,
        setVerificationCode,
        verificationCode,
        jwt
    };

    return (
        <SessionContext.Provider value={value}>
            {children}
        </SessionContext.Provider>
    )
}