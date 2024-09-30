import { globalContextInitialState } from "@/mocks";
import { GlobalContextType } from "@/types";
import { createContext, useState } from "react";



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