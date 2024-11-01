import { creditCard, logo, qrIcon } from "@/assets"
import { VStack, Image, Pressable} from "native-base"
import { useState } from "react"
import QRScanner from "../global/QRScanner"
import Cards from "../cards"



export const HomeHeaderLeft: React.FC = () => {
    return (
        <VStack>
            <Image alt='logo-image' w={"115px"} h={"30px"} source={logo} />
        </VStack>
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


export const HeaderBankingRight: React.FC = () => {
    const [showAllCards, setShowAllCards] = useState<boolean>(false)

    return (
        <VStack>
            <Pressable onPress={() => setShowAllCards(true)}>
                <Image alt='HeaderBankingRight-logo-image' w={"25px"} h={"25px"} source={creditCard} />
            </Pressable>
            <Cards onCloseFinish={() => setShowAllCards(false)} open={showAllCards} />
        </VStack>
    )
}