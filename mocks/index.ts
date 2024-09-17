import { Address, GlobalContextType } from "@/types";


export const globalContextInitialState: GlobalContextType = {
    email: "",
    setEmail: (_: string) => { },
    password: "",
    setPassword: (_: string) => { },
    names: "",
    setNames: (_: string) => { },
    lastNames: "",
    setLastNames: (_: string) => { },
    phoneNumber: "",
    idFront: "",
    setIdFront: (_: string) => { },
    idBack: "",
    setIdBack: (_: string) => { },
    addressAgreement: false,
    setAddressAgreement: (_: boolean) => { },
    address: "",
    setAddress: (_: string) => { },
    setPhoneNumber: (_: string) => { },
    userAgreement: false,
    setUserAgreement: (_: boolean) => { },
    resetAllStates: () => { }
}