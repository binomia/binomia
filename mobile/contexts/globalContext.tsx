import useAsyncStorage from "@/hooks/useAsyncStorage";
import { globalContextInitialState } from "@/mocks";
import { GlobalContextType } from "@/types";
import { createContext, useEffect, useState } from "react";
import { AppState } from "react-native";


export const GlobalContext = createContext<GlobalContextType>(globalContextInitialState);

export const GlobalContextProvider = ({ children }: { children: JSX.Element }) => {
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [names, setNames] = useState<string>("");
    const [lastNames, setLastNames] = useState<string>("");
    const [phoneNumber, setPhoneNumber] = useState<string>("");
    const [idFront, setIdFront] = useState<string>("");
    const [dni, setDNI] = useState<string>("");
    const [dniExpiration, setDNIExpiration] = useState<string>("");
    const [dniDOB, setDNIDOB] = useState<string>("");
    const [idBack, setIdBack] = useState<string>("");
    const [address, setAddress] = useState<string>(globalContextInitialState.address);
    const [userAgreement, setUserAgreement] = useState<boolean>(false);
    const [addressAgreement, setAddressAgreement] = useState<boolean>(false);
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [showCloseButton, setShowCloseButton] = useState<boolean>(globalContextInitialState.showCloseButton);
    const [disabledButton, setDisabledButton] = useState<boolean>(true);


    const { getItem, setItem } = useAsyncStorage();

    const resetAllStates = () => {
        setEmail("")
        setPassword("")
        setNames("")
        setLastNames("")
        setPhoneNumber("")
        setIdFront("")
        setIdBack("")
        setDNI("")
        setDNIExpiration("")
        setDNIDOB("")
        setShowCloseButton(false)
        setAddressAgreement(false)
        setAddress(globalContextInitialState.address)
        setUserAgreement(false)
        setShowPassword(false)
        setDisabledButton(true)
    }

    useEffect(() => {
        const subscription = AppState.addEventListener("change", async (nextAppState) => {
            if (nextAppState === 'background') {
                const now = Date.now();
                await setItem("appInBackgroundTime", now.toString());
            }

            if (nextAppState === 'active') {
                const now = Date.now();
                const appInBackgroundTime = await getItem("appInBackgroundTime");

                if (appInBackgroundTime) {
                    const duration = (now - Number(appInBackgroundTime)) / 1000;

                    if (duration > 60) {
                        // await authenticate().then(async () => {
                        //     const now = Date.now();
                        //     await setItem("appInBackgroundTime", now.toString());
                        // })
                    }
                }
            }
        });


        return () => {
            subscription.remove();
        };
    }, []);

    const data = {
        email,
        setEmail,

        password,
        setPassword,

        names,
        setNames,

        lastNames,
        setLastNames,

        phoneNumber,
        setPhoneNumber,

        address,
        setAddress,

        userAgreement,
        setUserAgreement,

        showPassword,
        setShowPassword,

        idFront,
        setIdFront,

        showCloseButton,
        setShowCloseButton,

        addressAgreement,
        setAddressAgreement,

        idBack,
        setIdBack,

        disabledButton,
        setDisabledButton,

        dni,
        setDNI,

        dniExpiration,
        setDNIExpiration,

        dniDOB,
        setDNIDOB,

        resetAllStates
    }

    return (
        <GlobalContext.Provider value={data}>
            {children}
        </GlobalContext.Provider>
    )
}