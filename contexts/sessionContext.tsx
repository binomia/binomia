import { createContext, useEffect, useState } from "react";
import { CreateUserDataType, SessionContextType, SessionPropsType, VerificationDataType } from "@/types";
import { useLazyQuery, useMutation } from '@apollo/client';
import { SessionApolloQueries, UserApolloQueries } from "@/apollo/query";
import * as Updates from 'expo-updates';
import { notificationServer } from "@/rpc/notificationRPC";
import { GENERATE_SIX_DIGIT_TOKEN } from "@/helpers";
import useAsyncStorage from "@/hooks/useAsyncStorage";
import { useSelector, useDispatch } from "react-redux";
import { globalActions } from "@/redux/slices/globalSlice";
import { UserAuthSchema } from "@/auth/userAuth";

export const SessionContext = createContext<SessionPropsType>({
    onLogin: (_: { email: string, password: string }) => Promise.resolve({}),
    onRegister: (_data: CreateUserDataType) => Promise.resolve({}),
    onLogout: () => { },
    sendVerificationCode: (_: string) => { },
    setVerificationCode: (_: string) => { },
    setVerificationData: (_: VerificationDataType) => { },
    setInvalidCredentials: (_: boolean) => { },
    invalidCredentials: false,
    verificationData: { token: "", signature: "", email: "" },
    verificationCode: "",
    jwt: "",
    applicationId: "",
});



export const SessionContextProvider = ({ children }: SessionContextType) => {
    const dispatch = useDispatch()
    const state = useSelector((state: any) => state.globalReducer)
    const { setItem, getItem, deleteItem } = useAsyncStorage()
    const [jwt, setJwt] = useState<string>("");
    const [applicationId, setApplicationId] = useState<string>("");
    const [verificationData, setVerificationData] = useState<VerificationDataType>({ token: "", signature: "", email: "" });
    const [verificationCode, setVerificationCode] = useState<string>("");
    const [invalidCredentials, setInvalidCredentials] = useState<boolean>(false);
    const [login] = useMutation(SessionApolloQueries.login());
    const [createUser] = useMutation(UserApolloQueries.createUser());
    const [getSessionUser] = useLazyQuery(UserApolloQueries.sessionUser());


    const fetchSessionUser = async () => {
        try {
            const user = await getSessionUser()

            const userProfileData = await UserAuthSchema.userProfileData.parseAsync(user.data.sessionUser)
            const kycData = await UserAuthSchema.kycData.parseAsync(user.data.sessionUser.kyc)
            const accountsData = await UserAuthSchema.accountsData.parseAsync(user.data.sessionUser.account)

            console.log({ userProfileData, kycData, accountsData });
            

            await Promise.all([
                dispatch(globalActions.setUser(userProfileData)),
                dispatch(globalActions.setKyc(kycData)),
                dispatch(globalActions.setAccount(accountsData))
            ])

        } catch (error) {
            await onLogout()
            console.error(error);
        }
    }

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
            console.log({ error });

            return error
        }
    }

    const onLogout = async () => {
        try {
            await deleteItem("jwt");
            await Updates.reloadAsync();

        } catch (error) {
            console.log({ error });
        }
    }

    const onLogin = async ({ email, password }: { email: string, password: string }): Promise<any> => {
        try {

            const data = await login({
                variables: { email, password },
                context: {
                    headers: {
                        device: JSON.stringify({ ...state.device, network: state.network, location: state.location }),
                        "session-auth-identifier": state.applicationId,
                        "authorization": state.applicationId,
                    }
                }
            });

            if (data.data.login) {
                await setItem("jwt", data.data.login)
                await Updates.reloadAsync();

                return data.data.login
            }

            return data
        } catch (error) {
            console.log({ error });

            setInvalidCredentials(true)
        }
    }

    const onRegister = async (data: CreateUserDataType): Promise<any> => {
        try {
            const createUserResponse = await createUser({
                variables: { data },

                context: { headers: { Authorization: `Bearer ${jwt}` } }
            })

            const token = createUserResponse.data?.createUser?.token
            await setItem("jwt", token)


            return createUserResponse.data
        } catch (error) {
            setInvalidCredentials(true)
        }
    }

    useEffect(() => {
        (async () => {
            const jwt = await getItem("jwt");
            const applicationId = await getItem("applicationId")


            if (applicationId) {
                await dispatch(globalActions.setApplicationId(applicationId))
                setApplicationId(applicationId)
            }

            if (jwt) {
                await dispatch(globalActions.setJwt(jwt))
                await fetchSessionUser()
                setJwt(jwt)
            }
        })()
        // onLogout()
    }, [])



    const value = {
        onLogin,
        onRegister,
        onLogout,
        login,
        sendVerificationCode,
        setVerificationCode,
        setVerificationData,
        setInvalidCredentials,
        invalidCredentials,
        verificationData,
        verificationCode,
        jwt,
        applicationId
    };

    return (
        <SessionContext.Provider value={value}>
            {children}
        </SessionContext.Provider>
    )
}



