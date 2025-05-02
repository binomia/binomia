import { askingForMoneyIcon, withdrawIcon, depositIcon, limitIcon, mailIcon, mastercardLogo, notificacionIcon, phoneIcon, privacyIcon, receiveIcon, sendMoneyIcon, soportIcon, userIcon, visaLogo, whatsappIcon, claroLogo, articeLogo } from "@/assets";
import { SUPPORT_EMAIL } from "@/constants";
import { FORMAT_CURRENCY, FORMAT_LIMIT, FORMAT_PHONE_NUMBER } from "@/helpers";
import { AccountLimitsType, AccountType, GlobalContextType } from "@/types";
import { cancelIcon, checked, pendingClock } from '@/assets';

export const topUpInitialState = {
    amount: 0,
    phoneNumber: "",
    fullName: "",
    company: {
        id: 0,
        uuid: "",
        status: "",
        name: "",
        logo: "",
        createdAt: "",
        updatedAt: ""
    },

    setAmount: (_: number) => { },
    setPhoneNumber: (_: string) => { },
    setFullName: (_: string) => { },
    setCompany: (_: any) => { }
}

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
        name: String(user?.email || "").toLowerCase(),
        icon: mailIcon,
    },
    {
        name: FORMAT_PHONE_NUMBER(user.phone),
        icon: phoneIcon,
    },
    // {
    //     name: user.dniNumber,
    //     icon: idIcon,
    // }
]


export const privacyScreenData = (account: any) => [
    {
        name: "Recibir Dinero",
        icon: receiveIcon,
        allow: account.allowReceive,
        id: "allowReceive"
    },
    {
        name: "Enviar Dinero",
        icon: sendMoneyIcon,
        allow: account.allowSend,
        id: "allowSend"
    },
    {
        name: "Solicitarme Dinero",
        icon: askingForMoneyIcon,
        allow: account.allowRequestMe,
        id: "allowRequestMe"
    },
    {
        name: "Retirar Dinero",
        icon: withdrawIcon,
        allow: account.allowWithdraw,
        id: "allowWithdraw"
    },
    {
        name: "Depositar Dinero",
        icon: depositIcon,
        allow: account.allowDeposit,
        id: "allowDeposit"
    }
]

export const limitsScreenData = (limits: AccountLimitsType, account: AccountType) => [
    {
        title: `Enviado ${FORMAT_CURRENCY(limits.sentAmount)} de ${FORMAT_CURRENCY(account.sendLimit)}`,
        value: limits.sentAmount,
        percentage: FORMAT_LIMIT(limits.sentAmount, account.sendLimit)
    },
    {
        title: `Recibido ${FORMAT_CURRENCY(limits.receivedAmount)} de ${FORMAT_CURRENCY(account.receiveLimit)}`,
        value: limits.receivedAmount,
        percentage: FORMAT_LIMIT(limits.receivedAmount, account.receiveLimit)
    },
    {
        title: `Retirado ${FORMAT_CURRENCY(limits.withdrawAmount)} de ${FORMAT_CURRENCY(account.withdrawLimit)}`,
        value: limits.withdrawAmount,
        percentage: FORMAT_LIMIT(limits.withdrawAmount, account.withdrawLimit)
    },
    {
        title: `Depositado ${FORMAT_CURRENCY(limits.depositAmount)} de ${FORMAT_CURRENCY(account.depositLimit)}`,
        value: limits.depositAmount,
        percentage: FORMAT_LIMIT(limits.depositAmount, account.depositLimit)
    }
]

export const transactionStatus = (title: string) => {
    switch (title) {
        case "approved":
            return "Aprobado"
        case "rejected":
            return "Rechazado"
        case "completed":
            return "Completada"
        case "paid":
            return "Pagado"
        case "cancelled":
            return "Cancelado"
        case "requested":
            return "Solicitado"
        case "waiting":
            return "La transacción está siendo procesada. Este proceso puede tardar unos minutos."
        case "suspicious":
            return "Transacción en revisión, por favor espere que terminemos, o comuníquese con nosotros."
        default:
            return "Procesando";
    }
}

export const transactionStatusColor = (title: string) => {
    switch (title) {
        case "approved":
            return "#4CAF50"
        case "rejected":
            return "#F44336"
        case "completed":
            return "#4CAF50"
        case "paid":
            return "#4CAF50"
        case "cancelled":
            return "#F44336"
        case "requested":
            return "#FF9800"
        case "waiting":
            return "#FF9800"
        case "suspicious":
            return "#FF9800"
        default:
            return "#FF9800";
    }
}

export const notificationsScreenData = ({ allowWhatsappNotification, allowPushNotification, allowEmailNotification, allowSmsNotification }: { allowWhatsappNotification: boolean, allowPushNotification: boolean, allowEmailNotification: boolean, allowSmsNotification: boolean }) => [
    {
        id: "allowWhatsappNotification",
        name: "Whatsapp",
        icon: whatsappIcon,
        allow: allowWhatsappNotification
    },
    {
        id: "allowPushNotification",
        name: "Notificaciónes Mobil",
        icon: notificacionIcon,
        allow: allowPushNotification
    },
    {
        id: "allowEmailNotification",
        name: "Correo Electrónico",
        icon: mailIcon,
        allow: allowEmailNotification
    },
    {
        id: "allowSmsNotification",
        name: "Mensajes SMS",
        icon: phoneIcon,
        allow: allowSmsNotification
    },

]

export const supportScreenData = ({ openEmail, openPhone, openWhatsApp }: any) => [
    {
        name: "Whatsapp",
        icon: whatsappIcon,
        onPress: () => openWhatsApp()
    },
    {
        name: SUPPORT_EMAIL,
        icon: mailIcon,
        onPress: () => openEmail(),
    },
    {
        name: "Contactanos",
        icon: phoneIcon,
        onPress: () => openPhone(),
    }
]

export const recurenceWeeklyData = [
    [
        { title: "Cada Lunes", id: "everyMonday" },
        { title: "Cada Martes", id: "everyTuesday" },
    ],
    [
        { title: "Cada Miercoles", id: "everyWednesday" },
        { title: "Cada Jueves", id: "everyThursday" },
    ],
    [
        { title: "Cada Viernes", id: "everyFriday" },
        { title: "Cada Sabado", id: "everySaturday" }
    ],
    [
        { title: "Cada Domingo", id: "everySunday" },
    ]
]


export const getTitleById = (id: string, arr: any[]) => {
    // Iterate through each sub-array in recurenceWeeklyData
    for (const group of arr) {
        // Iterate through each object in the sub-array
        for (const item of group) {
            // Check if the current item's id matches the input id
            if (item.id === id) {
                return item.title;
            }
        }
    }
    // Return null or a default value if the id is not found
    return null;
}

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
        { title: "Día 29 de cada mes", id: "everyTwentyNinth", day: "29" },
        { title: "Día 30 de cada mes", id: "everyThirtieth", day: "30" },
    ],
    [
        { title: "Día 31 de cada mes", id: "everyThirtyFirst", day: "31" }
    ]
]

export const mockCardsLogo = {
    "mastercard": mastercardLogo,
    "visa": visaLogo
}

export const statuTransactionIcons = {
    "completed": checked,
    "approved": checked,
    "cancelled": cancelIcon,
    "pending": pendingClock,
    "rejected": cancelIcon,
    "requested": pendingClock,
    "paid": checked
}

export const topupPhones = [
    {
        fullName: "Juan Perez",
        phone: "8298763290",
        provider: "Claro",
        providerLogo: claroLogo
    },
    {
        fullName: "Luis Lopez",
        phone: "8298763290",
        provider: "Artice",
        providerLogo: articeLogo
    },
    {
        fullName: "Pedro Gomez",
        phone: "8298763290",
        provider: "Claro",
        providerLogo: claroLogo
    }
]


export const topUpCompanies = [
    {
        uuid: "1",
        name: "Claro",
        logo: "https://res.cloudinary.com/brayhandeaza/image/upload/e_make_transparent:10/v1735248474/bitnomia/cotxkgldk09jjsrnw4ap.jpg"
    },
    {
        uuid: "2",
        name: "Viva",
        logo: "https://play-lh.googleusercontent.com/41hDt3wZUWEQAgFBAsNYj90R5DlGwaJB9L2CkkB3WeVBevsitCz-pV8o76ANcH792Q"
    },
    {
        uuid: "3",
        name: "Artice",
        logo: "https://res.cloudinary.com/brayhandeaza/image/upload/e_make_transparent:10/v1735248474/bitnomia/cotxkgldk09jjsrnw4ap.jpg"
    },
]