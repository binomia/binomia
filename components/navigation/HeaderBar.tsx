import { logo, qrIcon } from "@/assets"
import { VStack, Image, Pressable } from "native-base"
import { useState } from "react"

export const HomeHeaderLeft = () => {
    return (
        <VStack px={"15px"} >
            <Image alt='logo-image' w={"115px"} h={"30px"} source={logo} />
        </VStack>
    )
}

export const HomeHeaderRight = () => {
    const [showBottomSheet, setShowBottomSheet] = useState(false)


    return (
        <VStack px={"15px"}>
            <Pressable _pressed={{ opacity: 0.5 }} onPress={() => setShowBottomSheet(true)}>
                <Image alt='logo-image' w={"25px"} h={"25px"} source={qrIcon} />
            </Pressable>
            {/* <QRScannerScreen open={showBottomSheet} onCloseFinish={() => setShowBottomSheet(false)} /> */}
        </VStack>
    )
}