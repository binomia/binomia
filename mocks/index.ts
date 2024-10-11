import { askingForMoneyIcon, idIcon, limitIcon, mailIcon, notificacionIcon, phoneIcon, privacyIcon, receiveIcon, sendMoneyIcon, soportIcon, userIcon, whatsappIcon } from "@/assets";
import { SUPPORT_PHONE_NUMBER } from "@/constants";
import { FORMAT_CURRENCY, FORMAT_LIMIT, FORMAT_PHONE_NUMBER } from "@/helpers";
import { GlobalContextType } from "@/types";


export const globalContextInitialState: GlobalContextType = {
    setEmail: (_: string) => { },
    email: "",

    setPassword: (_: string) => { },
    password: "",

    setNames: (_: string) => { },
    names: "",

    setLastNames: (_: string) => { },
    lastNames: "",

    setPhoneNumber: (_: string) => { },
    phoneNumber: "",

    setIdFront: (_: string) => { },
    idFront: "",

    setIdBack: (_: string) => { },
    idBack: "",

    setAddressAgreement: (_: boolean) => { },
    addressAgreement: false,

    setAddress: (_: string) => { },
    address: "",

    userAgreement: false,
    setUserAgreement: (_: boolean) => { },

    showCloseButton: true,
    setShowCloseButton: (_: boolean) => { },

    dni: "",
    setDNI: (_: string) => { },

    dniExpiration: "",
    setDNIExpiration: (_: string) => { },

    dniDOB: "",
    setDNIDOB: (_: string) => { },

    resetAllStates: () => { }
}


export const profileScreenData = [
    {
        name: "Personal",
        path: "PersonalScreen",
        icon: userIcon,
    },
    {
        name: "Privacidad & Seguridad",
        path: "PrivacyScreen",
        icon: privacyIcon,
    },
    {
        name: "Limites",
        path: "LimitsScreen",
        icon: limitIcon,
    },
    {
        name: "Notificaciones",
        path: "NotificationsScreen",
        icon: notificacionIcon,
    },
    {
        name: "Soporte",
        path: "SupportScreen",
        icon: soportIcon,
    }
]

export const personalScreenData = (user: any) => [
    {
        name: user.fullName,
        icon: userIcon,
    },
    {
        name: user.email,
        icon: mailIcon,
    },
    {
        name: FORMAT_PHONE_NUMBER(user.phone),
        icon: phoneIcon,
    },
    {
        name: user.dniNumber,
        icon: idIcon,
    }
]


export const privacyScreenData = (account: any) => [
    {
        name: "Recibir Dinero",
        icon: receiveIcon,
        allow: account.allowReceive
    },
    {
        name: "Enviar Dinero",
        icon: sendMoneyIcon,
        allow: account.allowSend
    },
    {
        name: "Solicitarme Dinero",
        icon: askingForMoneyIcon,
        allow: account.allowAsk
    }
]

export const limitsScreenData = (account: any) => [
    {
        title: `Enviado ${FORMAT_CURRENCY(account.sentAmount)} de ${FORMAT_CURRENCY(account.withdrawLimit)}`,
        value: account.sentAmount,
        percentage: FORMAT_LIMIT(account.sentAmount, account.withdrawLimit)

    },
    {
        title: `Recibido ${FORMAT_CURRENCY(account.receivedAmount)} de ${FORMAT_CURRENCY(account.receiveLimit)}`,
        value: account.receivedAmount,
        percentage: FORMAT_LIMIT(account.receivedAmount, account.receiveLimit)
    },
    {
        title: `Retirado ${FORMAT_CURRENCY(account.withdrawAmount)} de ${FORMAT_CURRENCY(account.withdrawLimit)}`,
        value: account.withdrawAmount,
        percentage: FORMAT_LIMIT(account.withdrawAmount, account.withdrawLimit)

    }
]

export const notificationsScreenData = ({ pushNotifications, emailNotifications, smsNotifications }: any) => [
    {
        name: "Notificaciónes Mobil",
        icon: notificacionIcon,
        allow: pushNotifications
    },
    {
        name: "Correo Electrónico",
        icon: mailIcon,
        allow: emailNotifications
    },
    {
        name: "Mensajes SMS",
        icon: phoneIcon,
        allow: smsNotifications
    }
]

export const supportScreenData = ({ openEmail, openPhone, openWhatsApp }: any) => [
    {
        name: FORMAT_PHONE_NUMBER(SUPPORT_PHONE_NUMBER),
        icon: phoneIcon,
        onPress: () => openPhone(),
    },
    {
        name: "soporte@dinero.com.do",
        icon: mailIcon,
        onPress: () => openEmail(),
    },
    {
        name: "Whatsapp",
        icon: whatsappIcon,
        onPress: () => openWhatsApp()
    }
]