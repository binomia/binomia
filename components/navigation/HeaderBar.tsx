import QRScanner from "../global/QRScanner"
import Cards from "../cards"
import RecurrenceTransactions from "../transaction/recurrence/RecurrenceTransactions"
import NewTopUp from "../topups/NewTopUp"
import colors from "@/colors"
import { creditCard, logo, qrIcon, recurrenceIcon } from "@/assets"
import { VStack, Image, Pressable, HStack, Text, Stack, Heading, Avatar } from "native-base"
import { useState } from "react"
import { router } from "expo-router"
import { AntDesign, Entypo, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { scale } from "react-native-size-matters"
import { Platform } from "react-native"
import { useSelector } from "react-redux"
import { EXTRACT_FIRST_LAST_INITIALS, GENERATE_RAMDOM_COLOR_BASE_ON_TEXT, MAKE_FULL_NAME_SHORTEN } from "@/helpers"
import { useLazyQuery } from "@apollo/client"
import { AccountApolloQueries } from "@/apollo/query"

export const HomeHeaderLeft: React.FC = () => {
    return (
        <Image alt='logo-image' resizeMode="contain" w={scale(120)} h={"40px"} source={logo} />
    )
}

export const HomeHeaderRight: React.FC = () => {
    const [showBottomSheet, setShowBottomSheet] = useState(false)
    const [accountStatus] = useLazyQuery(AccountApolloQueries.accountStatus())


    const onPress = async () => {
        const { data } = await accountStatus()
        if (data.account.status === "flagged")
            router.navigate(`/flagged`)
        else
            setShowBottomSheet(true)
    }

    return (
        <VStack>
            <Pressable bg={colors.lightGray} w={"40px"} h={"40px"} alignItems={"center"} justifyContent={"center"} borderRadius={100} _pressed={{ opacity: 0.5 }} onPress={onPress}>
                <Image alt='logo-image' w={"20px"} tintColor={colors.mainGreen} h={"20px"} source={qrIcon} />
            </Pressable>
            <QRScanner open={showBottomSheet} onCloseFinish={() => setShowBottomSheet(false)} />
        </VStack>
    )
}

export const TransactionsHeaderRight: React.FC = () => {
    const [showBottomSheet, setShowBottomSheet] = useState(false)

    return (
        <VStack >
            <Pressable _pressed={{ opacity: 0.5 }} bg={colors.lightGray} w={"40px"} h={"40px"} alignItems={"center"} justifyContent={"center"} borderRadius={100} onPress={() => setShowBottomSheet(true)}>
                <Image alt='logo-image' w={"22px"} h={"22px"} source={recurrenceIcon} />
            </Pressable>
            <RecurrenceTransactions open={showBottomSheet} onCloseFinish={() => setShowBottomSheet(false)} onSendFinish={() => setShowBottomSheet(false)} />
        </VStack>
    )
}
export const BankingHeaderRight: React.FC = () => {
    const [showBottomSheet, setShowBottomSheet] = useState(false)
    return (
        <VStack >
            <Pressable _pressed={{ opacity: 0.5 }} bg={colors.lightGray} w={"40px"} h={"40px"} alignItems={"center"} justifyContent={"center"} borderRadius={100} onPress={() => setShowBottomSheet(true)}>
                <Image alt='logo-image' w={"22px"} h={"22px"} source={creditCard} />
            </Pressable>
            <Cards onCloseFinish={() => setShowBottomSheet(false)} open={showBottomSheet} />
        </VStack>
    )
}

export const RecurrencesHeaderRight: React.FC = () => {
    return (
        <VStack >
            <Pressable _pressed={{ opacity: 0.5 }} onPress={() => router.navigate("recurrences")}>
                <Image alt='logo-image' tintColor={"white"} w={"25px"} h={"25px"} source={recurrenceIcon} />
            </Pressable>
        </VStack>
    )
}
export const TransactionCenter: React.FC = () => {
    const { transaction } = useSelector((state: any) => state.transactionReducer)

    return (
        <HStack alignItems={"center"}>
            {transaction?.profileImageUrl ?
                <Image borderRadius={100} resizeMode='contain' alt='logo-image' w={scale(35)} h={scale(35)} source={{ uri: transaction?.profileImageUrl }} />
                :
                <Avatar borderRadius={100} w={"50px"} h={"50px"} bg={GENERATE_RAMDOM_COLOR_BASE_ON_TEXT(transaction?.fullName || "")}>
                    <Heading size={"sm"} color={colors.white}>
                        {EXTRACT_FIRST_LAST_INITIALS(transaction?.fullName || "0")}
                    </Heading>
                </Avatar>
            }
            <VStack ml={"10px"} alignItems={"center"} >
                <Heading textTransform={"capitalize"} fontSize={scale(18)} color={"white"}>{MAKE_FULL_NAME_SHORTEN(transaction?.fullName || "")}</Heading>
                <Text fontSize={scale(15)} color={colors.lightSkyGray}>{transaction?.username}</Text>
            </VStack>
        </HStack>
    )
}
export const HeaderBankingRight: React.FC = () => {
    const [showBottomSheet, setShowBottomSheet] = useState(false)

    return (
        <VStack>
            <Pressable onPress={() => setShowBottomSheet(true)}>
                <Image alt='HeaderBankingRight-logo-image' w={"25px"} h={"25px"} source={creditCard} />
            </Pressable>
            <Cards open={showBottomSheet} onCloseFinish={() => setShowBottomSheet(false)} />
        </VStack>
    )
}
export const WelcomeLeft: React.FC = () => {
    return (
        <HStack>
            <Image alt='logo-image' resizeMode="contain" w={"130px"} h={"35px"} source={logo} />
        </HStack>
    )
}
export const WelcomeRight: React.FC = () => {
    return (
        <Pressable onPress={() => router.navigate("/login")}>
            <Text fontSize={"16px"} fontWeight={"extrabold"} color={"mainGreen"}>Iniciar Sesión</Text>
        </Pressable>
    )
}
export const LoginRight: React.FC = () => {
    return (
        <Pressable onPress={() => router.navigate("/register")}>
            <Text fontSize={"16px"} fontWeight={"extrabold"} color={"mainGreen"}>Registrarse</Text>
        </Pressable>
    )
}
export const CardsRight: React.FC = () => {
    return (
        <Pressable _pressed={{ opacity: 0.5 }} onPress={() => { }}>
            <AntDesign name="pluscircle" size={22} color="white" />
        </Pressable>
    )
}
export const TopupsRight: React.FC = () => {
    const [openBottomSheet, setOpenBottomSheet] = useState(false)
    const [accountStatus] = useLazyQuery(AccountApolloQueries.accountStatus())


    const onPress = async () => {
        const { data } = await accountStatus()
        if (data.account.status === "flagged")
            router.navigate(`/flagged`)
        else
            setOpenBottomSheet(true)
    }

    return (
        <Pressable w={"35px"} h={"35px"} alignItems={"center"} justifyContent={"center"} _pressed={{ opacity: 0.5 }} bg={colors.lightGray} borderRadius={100} onPress={onPress}>
            <Entypo name="plus" size={scale(20)} color={colors.mainGreen} />
            <NewTopUp onClose={() => setOpenBottomSheet(false)} open={openBottomSheet} />
        </Pressable>
    )
}
export const BackHeaderIcon: React.FC = () => {
    return (
        <HStack alignItems={"center"} justifyContent={"space-between"}>
            {Platform.OS === "android" ?
                <HStack w={"100%"} justifyContent={"space-between"} alignItems={"center"}>
                    <HStack px={"10px"}>
                        <Pressable _pressed={{ opacity: 0.5 }} onPress={() => router.back()}>
                            <MaterialIcons name="arrow-back" size={25} color="white" />
                        </Pressable>
                        <Stack mx={"20px"}>
                            <Heading color={colors.white} textAlign={"center"}>Tarjetas</Heading>
                        </Stack>
                    </HStack>
                    <Pressable w={"35px"} _pressed={{ opacity: 0.5 }} alignItems={"center"} onPress={() => { }}>
                        <AntDesign name="pluscircle" size={22} color="white" />
                    </Pressable>
                </HStack>
                :
                <HStack w={"100%"} alignItems={"center"} justifyContent={"space-between"}>
                    <Pressable w={"35px"} _pressed={{ opacity: 0.5 }} onPress={() => router.back()}>
                        <Ionicons name="chevron-back-outline" size={30} color="white" />
                    </Pressable>
                    <Stack >
                        <Heading size={"sm"} color={colors.white} textAlign={"center"}>Tarjetas</Heading>
                    </Stack>
                    <Pressable w={"35px"} _pressed={{ opacity: 0.5 }} alignItems={"center"} onPress={() => { }}>
                        <AntDesign name="pluscircle" size={22} color="white" />
                    </Pressable>
                </HStack>
            }
        </HStack>
    )
}
