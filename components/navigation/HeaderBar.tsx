import { creditCard, logo, qrIcon, recurrenceIcon } from "@/assets"
import { VStack, Image, Pressable, HStack, Text } from "native-base"
import { useState } from "react"
import QRScanner from "../global/QRScanner"
import Cards from "../cards"
import { router } from "expo-router"
import colors from "@/colors"
import { AntDesign, Ionicons } from '@expo/vector-icons';



export const HomeHeaderLeft: React.FC = () => {
    return (
        <Image alt='logo-image'  w={"90px"} h={"30px"} source={logo} />
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
        <VStack>
            <Pressable onPress={() => router.navigate("cards")}>
                <Image alt='HeaderBankingRight-logo-image' w={"25px"} h={"25px"} source={creditCard} />
            </Pressable>
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