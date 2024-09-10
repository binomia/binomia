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
    address: {
        street: "",
        number: 0,
        city: "",
        province: "",
        municipality: ""
    },
    setAddress: (_: Address) => { },
    setPhoneNumber: (_: string) => { },
    userAgreement: false,
    setUserAgreement: (_: boolean) => { },
    resetAllStates: () => { }
}