import { askingForMoneyIcon, bankIcon, idIcon, limitIcon, mailIcon, notificacionIcon, phoneIcon, privacyIcon, receiveIcon, sendMoneyIcon, soportIcon, userIcon, whatsappIcon } from "@/assets";
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
        path: "/personal",
        icon: userIcon,
    },
    {
        name: "Privacidad & Seguridad",
        path: "/privacy",
        icon: privacyIcon,
    },
    {
        name: "Limites",
        path: "/limits",
        icon: limitIcon,
    },
    {
        name: "Notificaciones",
        path: "/notifications",
        icon: notificacionIcon,
    },
    {
        name: "Soporte",
        path: "/support",
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

export const transactionsMocks = [
    {
        "transactionId": "daEAdo2kdA3f7m3zz74EZvwkU6MVtfdUbn529QA5KP2E",
        "amount": 10,
        "deliveredAmount": 10,
        "voidedAmount": 0,
        "transactionType": "debit",
        "currency": "DOP",
        "status": "pending",
        "location": {
            "latitude": -17.5162,
            "longitude": -136.5157
        },
        "createdAt": "1729390764164",
        "updatedAt": "1729390764164",
        "from": {
            "id": 1,
            "balance": 940,
            "status": "active",
            "sentAmount": 0,
            "receivedAmount": 0,
            "withdrawAmount": 0,
            "allowReceive": true,
            "allowWithdraw": true,
            "allowSend": true,
            "allowAsk": true,
            "sendLimit": 50000,
            "receiveLimit": 50000,
            "withdrawLimit": 50000,
            "hash": "74VouppXYUYjWxwYD5inF4",
            "user": {
                "id": 1,
                "fullName": "test habib",
                "username": "$test_habib",
                "phone": "8098027293",
                "email": "test@fake.com",
                "dniNumber": "000-0000000-2",
                "password": "$2b$10$KnFmokId3zn/3FlGaUEra.PAsoADPR5KnaG5BKWVm98TGTGAglKqu",
                "profileImageUrl": null,
                "addressAgreementSigned": true,
                "userAgreementSigned": true,
                "idFrontUrl": "https://res.cloudinary.com/brayhandeaza/image/upload/v1727570912/dinero/cedulas/1727570911329.jpg",
                "status": "active",
                "idBackUrl": "https://res.cloudinary.com/brayhandeaza/image/upload/v1727570912/dinero/cedulas/1727570911329.jpg",
                "faceVideoUrl": "https://res.cloudinary.com/brayhandeaza/image/upload/v1727570912/dinero/cedulas/1727570911329.jpg",
                "address": "test",
                "createdAt": "1729226095853",
                "updatedAt": "1729226095853"
            },
            "currency": "DOP",
            "createdAt": "1729226095859",
            "updatedAt": "1729390764167"
        },
        "to": {
            "id": 2,
            "balance": 60,
            "status": "active",
            "sentAmount": 0,
            "receivedAmount": 0,
            "withdrawAmount": 0,
            "allowReceive": true,
            "allowWithdraw": true,
            "allowSend": true,
            "allowAsk": true,
            "sendLimit": 50000,
            "receiveLimit": 50000,
            "withdrawLimit": 50000,
            "hash": "bqQQNWndyHHxCdeQzVkqSm",
            "user": {
                "id": 2,
                "fullName": "test habib",
                "username": "$fake_habib",
                "phone": "8098027293",
                "email": "fake@fake.com",
                "dniNumber": "000-0000000-0",
                "password": "$2b$10$FfmHbHzACmqekkHYu6EoeuQUNJhbCJ78QtQaxQw1A2Qn80VHQ8T3y",
                "profileImageUrl": null,
                "addressAgreementSigned": true,
                "userAgreementSigned": true,
                "idFrontUrl": "https://res.cloudinary.com/brayhandeaza/image/upload/v1727570912/dinero/cedulas/1727570911329.jpg",
                "status": "active",
                "idBackUrl": "https://res.cloudinary.com/brayhandeaza/image/upload/v1727570912/dinero/cedulas/1727570911329.jpg",
                "faceVideoUrl": "https://res.cloudinary.com/brayhandeaza/image/upload/v1727570912/dinero/cedulas/1727570911329.jpg",
                "address": "test",
                "createdAt": "1729390737497",
                "updatedAt": "1729390737497"
            },
            "currency": "DOP",
            "createdAt": "1729390737503",
            "updatedAt": "1729390764169"
        }
    },
    {
        "transactionId": "mA1guMfL6C4wqdRupunQbWi9tHUJpQVFTeXUNanSZZEi",
        "amount": 10,
        "deliveredAmount": 10,
        "voidedAmount": 0,
        "transactionType": "debit",
        "currency": "DOP",
        "status": "pending",
        "location": {
            "latitude": -17.5162,
            "longitude": -136.5157
        },
        "createdAt": "1729390763140",
        "updatedAt": "1729390763140",
        "from": {
            "id": 1,
            "balance": 940,
            "status": "active",
            "sentAmount": 0,
            "receivedAmount": 0,
            "withdrawAmount": 0,
            "allowReceive": true,
            "allowWithdraw": true,
            "allowSend": true,
            "allowAsk": true,
            "sendLimit": 50000,
            "receiveLimit": 50000,
            "withdrawLimit": 50000,
            "hash": "74VouppXYUYjWxwYD5inF4",
            "user": {
                "id": 1,
                "fullName": "test habib",
                "username": "$test_habib",
                "phone": "8098027293",
                "email": "test@fake.com",
                "dniNumber": "000-0000000-2",
                "password": "$2b$10$KnFmokId3zn/3FlGaUEra.PAsoADPR5KnaG5BKWVm98TGTGAglKqu",
                "profileImageUrl": null,
                "addressAgreementSigned": true,
                "userAgreementSigned": true,
                "idFrontUrl": "https://res.cloudinary.com/brayhandeaza/image/upload/v1727570912/dinero/cedulas/1727570911329.jpg",
                "status": "active",
                "idBackUrl": "https://res.cloudinary.com/brayhandeaza/image/upload/v1727570912/dinero/cedulas/1727570911329.jpg",
                "faceVideoUrl": "https://res.cloudinary.com/brayhandeaza/image/upload/v1727570912/dinero/cedulas/1727570911329.jpg",
                "address": "test",
                "createdAt": "1729226095853",
                "updatedAt": "1729226095853"
            },
            "currency": "DOP",
            "createdAt": "1729226095859",
            "updatedAt": "1729390764167"
        },
        "to": {
            "id": 2,
            "balance": 60,
            "status": "active",
            "sentAmount": 0,
            "receivedAmount": 0,
            "withdrawAmount": 0,
            "allowReceive": true,
            "allowWithdraw": true,
            "allowSend": true,
            "allowAsk": true,
            "sendLimit": 50000,
            "receiveLimit": 50000,
            "withdrawLimit": 50000,
            "hash": "bqQQNWndyHHxCdeQzVkqSm",
            "user": {
                "id": 2,
                "fullName": "test habib",
                "username": "$fake_habib",
                "phone": "8098027293",
                "email": "fake@fake.com",
                "dniNumber": "000-0000000-0",
                "password": "$2b$10$FfmHbHzACmqekkHYu6EoeuQUNJhbCJ78QtQaxQw1A2Qn80VHQ8T3y",
                "profileImageUrl": null,
                "addressAgreementSigned": true,
                "userAgreementSigned": true,
                "idFrontUrl": "https://res.cloudinary.com/brayhandeaza/image/upload/v1727570912/dinero/cedulas/1727570911329.jpg",
                "status": "active",
                "idBackUrl": "https://res.cloudinary.com/brayhandeaza/image/upload/v1727570912/dinero/cedulas/1727570911329.jpg",
                "faceVideoUrl": "https://res.cloudinary.com/brayhandeaza/image/upload/v1727570912/dinero/cedulas/1727570911329.jpg",
                "address": "test",
                "createdAt": "1729390737497",
                "updatedAt": "1729390737497"
            },
            "currency": "DOP",
            "createdAt": "1729390737503",
            "updatedAt": "1729390764169"
        }
    }
]

export const recurenceWeeklyData = [
    [
        { title: "Cada Domingo", id: "everySunday" },
        { title: "Cada Lunes", id: "everyMonday" },
    ],
    [
        { title: "Cada Martes", id: "everyTuesday" },
        { title: "Cada Miercoles", id: "everyWednesday" },
    ],
    [
        { title: "Cada Jueves", id: "everyThursday" },
        { title: "Cada Viernes", id: "everyFriday" },
    ],
    [
        { title: "Cada Sabado", id: "everySaturday" }
    ]
]

export const recurenceMonthlyData = [
    [
        { title: "Día 1 de cada mes", id: "everyFirst", day: "1" },
        { title: "Día 2 de cada mes", id: "everySecond", day: "2" },
        { title: "Día 3 de cada mes", id: "everyThird", day: "3" },
        { title: "Día 4 de cada mes", id: "everyFourth", day: "4" },
        { title: "Día 5 de cada mes", id: "everyFifth", day: "5" },
    ],
    [
        { title: "Día 6 de cada mes", id: "everySixth", day: "6" },
        { title: "Día 7 de cada mes", id: "everySeventh", day: "7" },
        { title: "Día 8 de cada mes", id: "everyEighth", day: "8" },
        { title: "Día 9 de cada mes", id: "everyNinth", day: "9" },
        { title: "Día 10 de cada mes", id: "everyTenth", day: "10" },
    ],
    [
        { title: "Día 11 de cada mes", id: "everyEleventh", day: "11" },
        { title: "Día 12 de cada mes", id: "everyTwelfth", day: "12" },
        { title: "Día 13 de cada mes", id: "everyThirteenth", day: "13" },
        { title: "Día 14 de cada mes", id: "everyFourteenth", day: "14" },
        { title: "Día 15 de cada mes", id: "everyFifteenth", day: "15" },
    ],
    [
        { title: "Día 16 de cada mes", id: "everySixteenth", day: "16" },
        { title: "Día 17 de cada mes", id: "everySeventeenth", day: "17" },
        { title: "Día 18 de cada mes", id: "everyEighteenth", day: "18" },
        { title: "Día 19 de cada mes", id: "everyNineteenth", day: "19" },
        { title: "Día 20 de cada mes", id: "everyTwentieth", day: "20" },
    ],
    [
        { title: "Día 21 de cada mes", id: "everyTwentyFirst", day: "21" },
        { title: "Día 22 de cada mes", id: "everyTwentySecond", day: "22" },
        { title: "Día 23 de cada mes", id: "everyTwentyThird", day: "23" },
        { title: "Día 24 de cada mes", id: "everyTwentyFourth", day: "24" },
        { title: "Día 25 de cada mes", id: "everyTwentyFifth", day: "25" },
    ],
    [
        { title: "Día 26 de cada mes", id: "everyTwentySixth", day: "26" },
        { title: "Día 27 de cada mes", id: "everyTwentySeventh", day: "27" },
        { title: "Día 28 de cada mes", id: "everyTwentyEighth", day: "28" },
    ]
]
