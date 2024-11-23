import { creditCard, logo, qrIcon, recurrenceIcon } from "@/assets"
import { VStack, Image, Pressable, HStack, Text, Stack, Heading } from "native-base"
import { useState } from "react"
import QRScanner from "../global/QRScanner"
import Cards from "../cards"
import { router } from "expo-router"
import colors from "@/colors"
import { AntDesign, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { scale } from "react-native-size-matters"
import { Platform } from "react-native"



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
    return (
        <VStack p={p}>
            <Pressable _pressed={{ opacity: 0.5 }} onPress={() => router.navigate("recurrences")}>
                <Image alt='logo-image' tintColor={"white"} w={"25px"} h={"25px"} source={recurrenceIcon} />
            </Pressable>
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


export const HeaderBankingRight: React.FC = () => {
    return (
        <Pressable onPress={() => router.navigate("cards")}>
            <Image alt='HeaderBankingRight-logo-image' w={"25px"} h={"25px"} source={creditCard} />
        </Pressable>
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