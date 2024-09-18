import { createContext, useEffect, useState } from "react";
import { SessionContextType, SessionPropsType, VerificationDataType } from "@/types";
import { useMutation } from '@apollo/client';
import { SessionApolloQueries } from "@/apollo/query";
import * as SecureStore from 'expo-secure-store';
import * as Updates from 'expo-updates';
import { notificationServer } from "@/rpc/notificationRPC";
import { GENERATE_SIX_DIGIT_TOKEN } from "@/helpers";


export const SessionContext = createContext<SessionPropsType>({
    save: (_: string, __: string) => { },
    get: (_: string) => Promise.resolve(""),
    onLogin: (_: { email: string, password: string }) => { },
    onLogout: () => { },
    sendVerificationCode: (_: string) => { },
    setVerificationCode: (_: string) => { },
    setVerificationData: (_: VerificationDataType) => { },
    setInvalidCredentials: (_: boolean) => { },
    invalidCredentials: false,
    verificationData: { token: "", signature: "", email: "" },
    verificationCode: "",
    jwt: "",
});


export const SessionContextProvider = ({ children }: SessionContextType) => {
    const [jwt, setJwt] = useState<string>("");
    const [verificationData, setVerificationData] = useState<VerificationDataType>({ token: "", signature: "", email: "" });
    const [verificationCode, setVerificationCode] = useState<string>("");
    const [login] = useMutation(SessionApolloQueries.login());
    const [invalidCredentials, setInvalidCredentials] = useState<boolean>(false);



    const sendVerificationCode = async (to: string) => {
        try {
            const code = GENERATE_SIX_DIGIT_TOKEN()
            
            const message = await notificationServer("sendEmail", {
                to,
                code,
                subject: `Codigo De Verificación`,
                text: `Su Codigo De Verificación Es: ${code}`,
                html: `<b>Su Codigo De Verificación Es: ${code}</b>`
            })
            
            setVerificationCode(code)
            return message

        } catch (error: any) {
            return error
        }
    }



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


    const onLogin = async ({ email, password }: { email: string, password: string }): Promise<any> => {
        try {

            const data = await login({
                variables: { email, password }
            });

            if (data.data.login) {
                await save("jwt", data.data.login)
                await Updates.reloadAsync();

                return data.data.login
            }

            return data
        } catch (error) {
            setInvalidCredentials(true)
            console.log({ error });
        }
    }


    const value = {
        save,
        get,
        onLogin,
        onLogout,
        login,
        sendVerificationCode,
        setVerificationCode,
        setVerificationData,
        setInvalidCredentials,
        invalidCredentials, 
        verificationData,
        verificationCode,
        jwt
    };

    return (
        <SessionContext.Provider value={value}>
            {children}
        </SessionContext.Provider>
    )
}