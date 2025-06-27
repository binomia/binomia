import * as Crypto from 'expo-crypto';
import * as Network from 'expo-network';
import useAsyncStorage from "@/hooks/useAsyncStorage";
import { createContext, useEffect, useState } from "react";
import { CreateUserDataType, SessionContextType, SessionPropsType, VerificationDataType } from "@/types";
import { useLazyQuery, useMutation } from '@apollo/client';
import { SessionApolloQueries, UserApolloQueries } from "@/apollo/query";
import { useSelector, useDispatch } from "react-redux";
import { globalActions } from "@/redux/slices/globalSlice";
import { UserAuthSchema } from "@/auth/userAuth";
import { router } from "expo-router";
import { useLocation } from "@/hooks/useLocation";
import { AccountAuthSchema } from "@/auth/accountAuth";
import { useNotifications } from "@/hooks/useNotifications";
import { fetchAccountBankingTransactions, fetchAccountLimit, fetchAllTransactions, fetchRecentTopUps, fetchRecentTransactions } from "@/redux/fetchHelper";
import { accountActions } from "@/redux/slices/accountSlice";
import { registerActions } from "@/redux/slices/registerSlice";
import { topupActions } from "@/redux/slices/topupSlice";
import { transactionActions } from "@/redux/slices/transactionSlice";
import { useContacts } from "@/hooks/useContacts";
import { HASH } from "cryptografia";
import { z } from "zod";
import { SessionAuthSchema } from "@/auth/sessionAuth";

export const SessionContext = createContext<SessionPropsType>({
    onLogin: (_: { email: string, password: string }) => Promise.resolve({}),
    onRegister: (_data: CreateUserDataType) => Promise.resolve({}),
    onLogout: () => { },
    sendVerificationCode: (_: string) => { },
    setVerificationCode: (_: string) => { },
    setVerificationData: (_: VerificationDataType) => { },
    setSessionVerificationData: (_: z.infer<typeof SessionAuthSchema.verifySession>) => { },
    setInvalidCredentials: (_: boolean) => { },
    fetchSessionUser: () => Promise.resolve(),
    invalidCredentials: false,
    verificationData: { token: "", signature: "", email: "" },
    sessionVerificationData: { signature: null, needVerification: false, token: "", code: "", sid: "" },
    verificationCode: "",
    jwt: "",
    applicationId: "",
});



export const SessionContextProvider = ({ children }: SessionContextType) => {
    const dispatch = useDispatch()
    const { device, network, location } = useSelector((state: any) => state.globalReducer)
    const { getLocation } = useLocation()
    const { setItem, getItem, deleteItem } = useAsyncStorage()
    const [jwt, setJwt] = useState<string>("");
    const [applicationId, setApplicationId] = useState<string>("");
    const [verificationData, setVerificationData] = useState<VerificationDataType>({ token: "", signature: "", email: "" });
    const [sessionVerificationData, setSessionVerificationData] = useState<z.infer<typeof SessionAuthSchema.verifySession>>({
        signature: "",
        token: "",
        sid: "",
        code: "",
        needVerification: false
    });
    const [verificationCode, setVerificationCode] = useState<string>("");
    const [invalidCredentials, setInvalidCredentials] = useState<boolean>(false);
    const [login] = useMutation(SessionApolloQueries.login());
    const [createUser] = useMutation(UserApolloQueries.createUser());
    const [getSessionUser] = useLazyQuery(UserApolloQueries.sessionUser());
    const { getContacts } = useContacts();


    const { registerForPushNotificationsAsync } = useNotifications()


    const fetchSessionUser = async () => {
        try {
            const user = await getSessionUser()

            const userProfileData = await UserAuthSchema.userProfileData.parseAsync(user.data.sessionUser)
            const kycData = await UserAuthSchema.kycData.parseAsync(user.data.sessionUser.kyc)
            const accountsData = await AccountAuthSchema.account.parseAsync(user.data.sessionUser.account)
            const cardsData = await UserAuthSchema.cardsData.parseAsync(user.data.sessionUser.cards)
            const primaryCard = cardsData.find((card: any) => card.isPrimary === true)

            const contacts = await getContacts()

            await Promise.all([
                dispatch(accountActions.setUser(userProfileData ?? {})),
                dispatch(accountActions.setKyc(kycData ?? {})),
                dispatch(accountActions.setAccount(accountsData ?? {})),
                dispatch(accountActions.setCards(cardsData ?? {})),
                dispatch(accountActions.setCard(primaryCard ?? {})),

                dispatch(globalActions.setContacts(contacts)),

                dispatch(fetchRecentTransactions()),
                dispatch(fetchAllTransactions({ page: 1, pageSize: 10 })),
                dispatch(fetchAccountBankingTransactions({ page: 1, pageSize: 30 })),
                dispatch(fetchRecentTopUps()),
                dispatch(fetchAccountLimit()),
            ])

        } catch (error) {
            // await onLogout()
            console.error(error);
        }
    }

    const sendVerificationCode = async () => {
        try {


        } catch (error: any) {
            console.log({ error });

            return error
        }
    }

    const onLogout = async () => {
        try {
            await deleteItem("jwt");

            await Promise.all([
                dispatch(globalActions.setJwt("")),
                dispatch(accountActions.reSetAllState()),
                dispatch(registerActions.reSetAllState()),
                dispatch(topupActions.reSetAllState()),
                dispatch(transactionActions.reSetAllState())
            ])

            router.navigate("login")


        } catch (error) {
            console.log({ onLogout: error });
        }
    }

    const onLogin = async ({ email, password }: { email: string, password: string }): Promise<any> => {
        try {
            const expoNotificationToken = await registerForPushNotificationsAsync()

            const { data } = await login({
                variables: { email, password },
                context: {
                    headers: {
                        device: JSON.stringify({ ...device, network, location }),
                        "session-auth-identifier": applicationId,
                        "authorization": applicationId,
                        expoNotificationToken: expoNotificationToken || "",
                    }
                }
            });


            const loginValidation = z.object({
                needVerification: z.literal(false),
                token: z.string(),

            })

            const { success, data: loginData } = loginValidation.safeParse(data.login)
            if (success) {
                await setItem("jwt", loginData.token)
                await setItem("signingKey", data.login.signingKey)

                await fetchSessionUser()
                router.navigate("(home)")
            } else
                return data.login

        } catch (error) {
            setInvalidCredentials(true)
            console.log({ onLogin: error });

            return error
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
        } catch (_) {
            setInvalidCredentials(true)
        }
    }
    const setNotifications = async () => {
        const [whatsappNotification, emailNotification, smsNotification, pushNotification] = await Promise.all([
            getItem("whatsappNotification"),
            getItem("emailNotification"),
            getItem("smsNotification"),
            getItem("pushNotification")
        ])

        if (!whatsappNotification) {
            await setItem("whatsappNotification", "true");
            await dispatch(globalActions.setWhatsappNotification(true));

        } else {
            await dispatch(globalActions.setWhatsappNotification(whatsappNotification === "true"));
        }

        if (!emailNotification) {
            await setItem("emailNotification", "true");
            await dispatch(globalActions.setEmailNotification(true));

        } else {
            await dispatch(globalActions.setEmailNotification(emailNotification === "true"));
        }

        if (!smsNotification) {
            await setItem("smsNotification", "true");
            await dispatch(globalActions.setSmsNotification(true));

        } else {
            await dispatch(globalActions.setSmsNotification(smsNotification === "true"));
        }

        if (!pushNotification) {
            await setItem("pushNotification", "true");
            await dispatch(globalActions.setPushNotification(true));

        } else {
            await dispatch(globalActions.setPushNotification(pushNotification === "true"));
        }
    }

    useEffect(() => {
        (async () => {
            try {
                const jwt = await getItem("jwt");
                if (!jwt) {
                    onLogout()
                    return
                }


                setJwt(jwt);
                const _applicationId = await getItem("applicationId")
                const applicationId = _applicationId || HASH.stringToHex(HASH.sha256(Crypto.randomUUID()));
                const [ip, network] = await Promise.all([Network.getIpAddressAsync(), Network.getNetworkStateAsync()])
                const location = await getLocation()

                setItem("applicationId", applicationId)
                setApplicationId(applicationId)

                await Promise.all([
                    dispatch(globalActions.setJwt(jwt)),
                    dispatch(globalActions.setApplicationId(applicationId)),
                    dispatch(globalActions.setNetwork({ ...network, ip })),
                    dispatch(globalActions.setLocation(location)),

                    getLocation(),
                    setNotifications(),
                    fetchSessionUser()
                ])

            } catch (error) {
                console.log({ error });
            }
        })()
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
        setSessionVerificationData,
        fetchSessionUser,
        sessionVerificationData,
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



