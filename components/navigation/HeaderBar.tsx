import { creditCard, logo, qrIcon, recurrenceIcon } from "@/assets"
import { VStack, Image, Pressable, HStack, Text, Stack, Heading } from "native-base"
import { StyleSheet } from "react-native"

import { useState } from "react"
import QRScanner from "../global/QRScanner"
import Cards from "../cards"
import { router } from "expo-router"
import colors from "@/colors"
import { AntDesign, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { scale } from "react-native-size-matters"
import { Dimensions, Platform } from "react-native"
import RecurrenceTransactions from "../transaction/recurrence/RecurrenceTransactions"
import { useSelector } from "react-redux"
import DefaultIcon from "react-native-default-icon"
import { GENERATE_RAMDOM_COLOR_BASE_ON_TEXT, MAKE_FULL_NAME_SHORTEN } from "@/helpers"


const { width } = Dimensions.get('window')

export const HomeHeaderLeft: React.FC = () => {
    return (
        <Image alt='logo-image' resizeMode="contain" w={scale(120)} h={"40px"} source={logo} />
    )
}

export const HomeHeaderRight: React.FC<{ p?: string }> = ({ p = "0" }) => {
    const [showBottomSheet, setShowBottomSheet] = useState(false)

    return (
        <VStack p={p}>
            <Pressable _pressed={{ opacity: 0.5 }} onPress={() => setShowBottomSheet(true)}>
                <Image alt='logo-image' w={"25px"} h={"25px"} source={qrIcon} />
            </Pressable>
            <QRScanner open={showBottomSheet} onCloseFinish={() => setShowBottomSheet(false)} />
        </VStack>
    )
}

export const TransactionsHeaderRight: React.FC<{ p?: string }> = ({ p = "0" }) => {
    const [showBottomSheet, setShowBottomSheet] = useState(false)

    return (
        <VStack p={p}>
            <Pressable _pressed={{ opacity: 0.5 }} onPress={() => setShowBottomSheet(true)}>
                <Image alt='logo-image' tintColor={"white"} w={"25px"} h={"25px"} source={recurrenceIcon} />
            </Pressable>
            <RecurrenceTransactions open={showBottomSheet} onCloseFinish={() => setShowBottomSheet(false)} onSendFinish={() => setShowBottomSheet(false)} />
        </VStack>
    )
}

export const RecurrencesHeaderRight: React.FC<{ p?: string }> = ({ p = "0" }) => {
    const [showBottomSheet, setShowBottomSheet] = useState(false)

    return (
        <VStack p={p}>
            <Pressable _pressed={{ opacity: 0.5 }} onPress={() => router.navigate("recurrences")}>
                <Image alt='logo-image' tintColor={"white"} w={"25px"} h={"25px"} source={recurrenceIcon} />
            </Pressable>
        </VStack>
    )
}
export const TransactionCenter: React.FC<{ p?: string }> = ({ p = "0" }) => {
    const { transaction } = useSelector((state: any) => state.transactionReducer)

    const [showBottomSheet, setShowBottomSheet] = useState(false)

    return (
        <HStack alignItems={"center"}>
            {transaction?.profileImageUrl ?
                <Image borderRadius={100} resizeMode='contain' alt='logo-image' w={scale(35)} h={scale(35)} source={{ uri: transaction?.profileImageUrl }} />
                :
                <DefaultIcon
                    value={transaction?.fullName || ""}
                    contentContainerStyle={[styles.contentContainerStyle, { width: scale(width / 4), height: scale(width / 4), backgroundColor: GENERATE_RAMDOM_COLOR_BASE_ON_TEXT(transaction?.fullName || "") }]}
                    textStyle={styles.textStyle}
                />
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
            <Image alt='logo-image' resizeMode="contain" w={"108px"} h={"34px"} source={logo} />
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
    return (
        <Pressable _pressed={{ opacity: 0.5 }} onPress={() => { }}>
            <AntDesign name="pluscircle" size={22} color="white" />
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


const styles = StyleSheet.create({
    contentContainerStyle: {
        width: 55,
        height: 55,
        borderRadius: 100
    },
    textStyle: {
        fontSize: 30,
        color: 'white',
        marginBottom: 2,
        textTransform: 'capitalize',
        fontWeight: 'bold',
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    }
})