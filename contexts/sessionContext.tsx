import { createContext, useEffect, useState } from "react";
import { CreateUserDataType, SessionContextType, SessionPropsType, SessionVerificationDataType, VerificationDataType } from "@/types";
import { useLazyQuery, useMutation } from '@apollo/client';
import { SessionApolloQueries, UserApolloQueries } from "@/apollo/query";
import { notificationServer } from "@/rpc/notificationRPC";
import { GENERATE_SIX_DIGIT_TOKEN } from "@/helpers";
import useAsyncStorage from "@/hooks/useAsyncStorage";
import { useSelector, useDispatch } from "react-redux";
import { globalActions } from "@/redux/slices/globalSlice";
import { UserAuthSchema } from "@/auth/userAuth";
import { router } from "expo-router";
import * as Crypto from 'expo-crypto';
import * as Network from 'expo-network';
import { useLocation } from "@/hooks/useLocation";

export const SessionContext = createContext<SessionPropsType>({
    onLogin: (_: { email: string, password: string }) => Promise.resolve({}),
    onRegister: (_data: CreateUserDataType) => Promise.resolve({}),
    onLogout: () => { },
    sendVerificationCode: (_: string) => { },
    setVerificationCode: (_: string) => { },
    setVerificationData: (_: VerificationDataType) => { },
    setSessionVerificationData: (_: SessionVerificationDataType) => { },
    setInvalidCredentials: (_: boolean) => { },
    invalidCredentials: false,
    verificationData: { token: "", signature: "", email: "" },
    sessionVerificationData: { signature: "", token: "", code: "", sid: "" },
    verificationCode: "",
    jwt: "",
    applicationId: "",
});



export const SessionContextProvider = ({ children }: SessionContextType) => {
    const dispatch = useDispatch()
    const state = useSelector((state: any) => state.globalReducer)
    const { getLocation } = useLocation()
    const { setItem, getItem, deleteItem } = useAsyncStorage()
    const [jwt, setJwt] = useState<string>("");
    const [applicationId, setApplicationId] = useState<string>("");
    const [verificationData, setVerificationData] = useState<VerificationDataType>({ token: "", signature: "", email: "" });
    const [sessionVerificationData, setSessionVerificationData] = useState<SessionVerificationDataType>({ signature: "", token: "", sid: "", code: "" });
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
            const cardsData = await UserAuthSchema.cardsData.parseAsync(user.data.sessionUser.cards)
            const primaryCard = cardsData.find((card: any) => card.isPrimary === true)
         

            await Promise.all([
                dispatch(globalActions.setUser(userProfileData)),
                dispatch(globalActions.setKyc(kycData)),
                dispatch(globalActions.setAccount(accountsData)),
                dispatch(globalActions.setCards(cardsData)),
                dispatch(globalActions.setCard(primaryCard ?? {}))
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
            router.navigate("login")

        } catch (error) {
            console.log({ onLogout: error });
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

            if (!data.data.login.needVerification && data.data.login.token) {
                await setItem("jwt", data.data.login.token)
                await fetchSessionUser()
                router.navigate("(home)")
                // await Updates.reloadAsync();
            }

            return data.data.login

        } catch (error) {
            setInvalidCredentials(true)
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
        } catch (error) {
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
                const _applicationId = await getItem("applicationId")

                let applicationId = _applicationId;
                if (!applicationId) {
                    applicationId = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, Crypto.randomUUID().toString(), {
                        encoding: Crypto.CryptoEncoding.HEX
                    })
                    setItem("applicationId", applicationId)
                }

                const [ip, network] = await Promise.all([Network.getIpAddressAsync(), Network.getNetworkStateAsync()])
                const location = await getLocation()


                const jwt = await getItem("jwt");
                if (!jwt) {
                    return;
                };

                setJwt(jwt);

                await Promise.all([
                    dispatch(globalActions.setNetwork({ ...network, ip })),
                    dispatch(globalActions.setLocation(location))
                ])

                await dispatch(globalActions.setApplicationId(applicationId))
                await setNotifications();

            } catch (error) {
                console.log({ error });
            }
        })()
    }, [])

    useEffect(() => {
        (async () => {
            const jwt = await getItem("jwt");
            const _applicationId = await getItem("applicationId")

            let applicationId = _applicationId;
            if (!applicationId) {
                applicationId = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, Crypto.randomUUID().toString(), {
                    encoding: Crypto.CryptoEncoding.HEX
                })
                setItem("applicationId", applicationId)
            }


            if (applicationId) {
                await dispatch(globalActions.setApplicationId(applicationId))
                setApplicationId(applicationId)
            }

            if (jwt) {
                await dispatch(globalActions.setJwt(jwt))
                await fetchSessionUser()
                
                const [ip, network] = await Promise.all([Network.getIpAddressAsync(), Network.getNetworkStateAsync()])
                const location = await getLocation()
                
                await Promise.all([
                    dispatch(globalActions.setNetwork({ ...network, ip })),
                    dispatch(globalActions.setLocation(location))
                ])
                
                await dispatch(globalActions.setApplicationId(applicationId))
                await setNotifications();
                setJwt(jwt)

            } else {
                router.navigate("/welcome")
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
        setSessionVerificationData,
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



