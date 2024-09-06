import { createContext, useEffect, useState } from "react";
import { SessionContextType, SessionPropsType } from "../types";
import { useMutation } from '@apollo/client';
import { SessionApolloQueries } from "../apollo/query/sessionQuery";
import * as SecureStore from 'expo-secure-store';
import * as Updates from 'expo-updates';


export const SessionContext = createContext<SessionPropsType>({
    onLogin: (_: { email: string, password: string }) => { },
    onLogout: () => { },
    jwt: "",
});


export const SessionContextProvider = ({ children }: SessionContextType) => {
    const [jwt, setJwt] = useState<string>("");

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
        await remove("jwt");
        await Updates.reloadAsync();
    }


    const onLogin = async ({ email, password }: { email: string, password: string }) => {
        const data = await login({
            variables: { email, password }
        });

        if (data.data.login) {
            await save("jwt", data.data.login)
            await Updates.reloadAsync();

            return data.data.login
        }

        return ""
    }


    const value = {
        onLogin,
        onLogout,
        jwt
    };

    return (
        <SessionContext.Provider value={value}>
            {children}
        </SessionContext.Provider>
    )
}