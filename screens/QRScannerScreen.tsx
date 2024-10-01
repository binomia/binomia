import { StyleSheet, Dimensions } from 'react-native'
import React, { useRef, useState } from 'react'
import { Camera, useCameraDevice, useCodeScanner } from 'react-native-vision-camera'
import { HStack, VStack, ZStack, Text, Image } from 'native-base'
import { z } from 'zod'
import colors from '@/colors'
import * as Linking from 'expo-linking';
import PagerView from 'react-native-pager-view';
import Button from '@/components/global/Button'
import BottomSheet from '@/components/global/BottomSheet'
import QRCodeStyled from 'react-native-qrcode-styled';
import { logo, logoChar, pendingVerificationSVG } from '@/assets'



type Props = {
    open?: boolean
    onCloseFinish?: () => void
}


const { height, width } = Dimensions.get('window')
const QRScannerScreen: React.FC<Props> = ({ open, onCloseFinish }: Props) => {
    const pageFef = useRef<PagerView>(null);

    const ref = useRef<Camera>(null);
    const device = useCameraDevice("back");
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [qrCode, setQrCode] = useState<string>("");

    const codeScanner = useCodeScanner({
        codeTypes: ['qr'],
        onCodeScanned: (codes) => {
            const { success, data } = z.string().regex(/\$.+/).safeParse(codes[0].value)

            if (success) {
                if (!qrCode)
                    setQrCode(data)

            } else {
                const { success, data } = z.string().url().safeParse(codes[0].value)

                if (success)
                    Linking.openURL(data)
            }

            // if (onCloseFinish)
            //     onCloseFinish()

        }
    })

    const onOpenFinish = () => {
        setQrCode("")
    }

    const onCloseFinished = () => {
        if (onCloseFinish)
            onCloseFinish()

        setQrCode("")
    }

    return (
        <BottomSheet onOpenFinish={onOpenFinish} showDragIcon={false} height={height * 0.90} open={open} onCloseFinish={onCloseFinished}>
            {device &&
                <PagerView scrollEnabled={false} style={{ flex: 1 }} initialPage={currentPage} ref={pageFef}>
                    <ZStack key={"1"} flex={1}>
                        <Camera
                            codeScanner={codeScanner}
                            ref={ref}
                            style={StyleSheet.absoluteFillObject}
                            device={device}
                            pixelFormat="rgb"
                            isActive
                            focusable
                        />
                        <VStack space={2} w={"100%"} h={"90%"} alignItems={"center"} justifyContent={"space-between"}>
                            <VStack alignItems={"center"} pt={"30px"}>
                                <HStack w={width * 0.85} h={width * 0.85} alignItems={"center"} justifyContent={"center"} borderRadius={"25px"} borderWidth={3} borderColor={colors.white} />
                                <HStack borderRadius={"10px"} mt={"10px"} py={"7px"} px={"15px"} bg={colors.darkGray} >
                                    <Text color={colors.white}>{qrCode ? qrCode : "Escanea el Codigo QR"}</Text>
                                </HStack>
                            </VStack>
                            <HStack w={width * 0.85}>
                                <HStack p={"3px"} h={55} borderRadius={50} bg={"rgba(0,0,0,0.5)"} w={"100%"} justifyContent={"space-between"}>
                                    <Button
                                        bg={currentPage === 0 ? "mainGreen" : "rgba(0,0,0,0.5)"}
                                        disabled={currentPage === 0}
                                        w={"49%"}
                                        h={"100%"}
                                        onPress={() => {
                                            pageFef.current?.setPageWithoutAnimation(0)
                                            setCurrentPage(0)
                                        }}
                                        title="Escanea"
                                    />
                                    <Button
                                        bg={currentPage === 1 ? "mainGreen" : null}
                                        w={"49%"}
                                        h={"100%"}
                                        onPress={() => {
                                            pageFef.current?.setPageWithoutAnimation(1)
                                            setCurrentPage(1)
                                        }}
                                        title="Mi Codigo"
                                    />
                                </HStack>
                            </HStack>
                        </VStack>
                    </ZStack>
                    <VStack key={"2"} flex={1}>
                        <VStack space={2} w={"100%"} h={"90%"} alignItems={"center"} justifyContent={"space-between"}>
                            <VStack alignItems={"center"} pt={"30px"}>
                                <HStack w={width * 0.85} h={width * 0.85} alignItems={"center"} borderWidth={0} borderColor={colors.gray} justifyContent={"center"} borderRadius={"20px"} bg={colors.lightGray} >
                                    <QRCodeStyled
                                        color={"#535353"}
                                        data={'#simple'}
                                        pieceLiquidRadius={0}
                                        logo={{
                                            width: width / 10,
                                            href: logo,
                                            padding: 5,
                                            scale: 1.5
                                        }}
                                        padding={20}
                                        style={{
                                            backgroundColor: "transparent"
                                        }}
                                        outerEyesOptions={{ borderRadius: 30 }}
                                        innerEyesOptions={{ borderRadius: 20 }}
                                        pieceSize={width / 29}
                                        // pieceStroke={colors.gray}
                                        pieceBorderRadius={5}
                                    />
                                </HStack>
                                <HStack borderRadius={"10px"} mb={"10px"} py={"7px"} px={"15px"} bg={colors.darkGray} >
                                    <Text color={colors.white}>Escanea el código QR{width / 30}</Text>
                                </HStack>
                            </VStack>
                            <HStack w={width * 0.85}>
                                <HStack h={55} borderRadius={"25px"} bg={"rgba(0,0,0,0.5)"} p={"3px"} w={"100%"} justifyContent={"space-between"}>
                                    <Button
                                        bg={currentPage === 0 ? "mainGreen" : null}
                                        disabled={currentPage === 0}
                                        w={"49%"}
                                        h={"100%"}
                                        onPress={() => {
                                            pageFef.current?.setPageWithoutAnimation(0)
                                            setCurrentPage(0)
                                        }}
                                        title="Escanea"
                                    />
                                    <Button
                                        w={"49%"}
                                        h={"100%"}
                                        bg={currentPage === 1 ? "mainGreen" : null}
                                        onPress={() => {
                                            pageFef.current?.setPageWithoutAnimation(1)
                                            setCurrentPage(1)
                                        }}
                                        title="Mi Codigo"
                                    />
                                </HStack>
                            </HStack>
                        </VStack>
                    </VStack>
                </PagerView>
            }
        </BottomSheet>
    )
}


export default QRScannerScreen
