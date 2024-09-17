import { globalContextInitialState } from "@/mocks";
import { Address, GlobalContextType } from "@/types";
import { createContext, useState } from "react";



export const GlobalContext = createContext<GlobalContextType>(globalContextInitialState);

export const GlobalContextProvider = ({ children }: { children: JSX.Element }) => {
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [names, setNames] = useState<string>("");
    const [lastNames, setLastNames] = useState<string>("");
    const [phoneNumber, setPhoneNumber] = useState<string>("");
    const [idFront, setIdFront] = useState<string>("");
    const [idBack, setIdBack] = useState<string>("");
    const [address, setAddress] = useState<string>(globalContextInitialState.address);
    const [userAgreement, setUserAgreement] = useState<boolean>(false);
    const [addressAgreement, setAddressAgreement] = useState<boolean>(false);
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [disabledButton, setDisabledButton] = useState<boolean>(true);


    const resetAllStates = () => {
        setEmail("")
        setPassword("")
        setNames("")
        setLastNames("")
        setPhoneNumber("")
        setIdFront("")
        setIdBack("")
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
        disabledButton,
        idFront,
        setIdFront,
        idBack,
        addressAgreement,
        setAddressAgreement,
        setIdBack,
        setDisabledButton,
        resetAllStates
    }

    return (
        <GlobalContext.Provider value={data}>
            {children}
        </GlobalContext.Provider>
    )
}