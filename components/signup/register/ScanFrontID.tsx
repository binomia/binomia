import { useContext, useEffect, useState } from 'react';
import { VStack, Heading, Text, HStack, Image, Pressable, Stack, Box, ZStack } from 'native-base';
import { StyleSheet, Keyboard, TouchableWithoutFeedback, Dimensions, TouchableOpacity, ScrollView } from 'react-native';
import colors from '@/colors';
import { TEXT_HEADING_FONT_SIZE, TEXT_PARAGRAPH_FONT_SIZE } from '@/constants';
import Button from '@/components/global/Button';
import { idFront } from '@/assets';
import BottomSheet from '@/components/global/BottomSheet';
import { useDocumentScanner } from '@/hooks/useDocumentScan';
import { CameraView } from 'expo-camera';
import { GlobalContext } from '@/contexts/globalContext';
import { GlobalContextType } from '@/types';

type Props = {
    nextPage: () => void
    prevPage: () => void
}

const { width, height } = Dimensions.get("window");

const ScanID: React.FC<Props> = ({ nextPage, prevPage }: Props): JSX.Element => {
    const { setIdFront, idFront: idFrontScaned } = useContext<GlobalContextType>(GlobalContext);
    const [disabledButton, setDisabledButton] = useState<boolean>(true);
    const [openBottomSheet, setOpenBottomSheet] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const { scanDocument } = useDocumentScanner()



    const handleScanDocument = async () => {
        const image = await scanDocument()
        if (!image) return

        setIdFront(image || "")
    }


    useEffect(() => {
        if (idFrontScaned)
            setDisabledButton(false)

    }, [idFrontScaned])



    return (
        <ScrollView contentContainerStyle={{ flex: 1 }}>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <VStack h={"100%"} w={"100%"} justifyContent={"space-between"}>
                    <VStack pt={"10%"}>
                        <VStack px={"20px"} w={"100%"} alignItems={"flex-start"}>
                            <Heading fontSize={`${TEXT_HEADING_FONT_SIZE - 2}px`} color={"white"}>Cédula - Frontal</Heading>
                            <Text fontSize={`${TEXT_PARAGRAPH_FONT_SIZE}px`} w={"80%"} color={"white"}>
                                Para validar tu identidad, por favor, escanea la parte frontal de tu cédula.
                            </Text>
                        </VStack>
                        <VStack w={width} h={"52%"} px={"30px"} mt={"30px"} alignItems={"center"} >
                            <TouchableOpacity onPress={handleScanDocument} style={{ width: "100%", height: "100%" }}>
                                <Box shadow={7} w={"100%"} h={"100%"}>
                                    <ZStack w={"100%"} h={"100%"} alignItems={"center"}>
                                        <Image alt='id-front-scan' w={"100%"} h={"100%"} resizeMode="contain" source={idFrontScaned ? { uri: idFrontScaned } : idFront} />
                                    </ZStack>
                                </Box>
                            </TouchableOpacity>
                            {idFrontScaned ? <Button
                                mt={"10px"}
                                w={"60%"}
                                bg={"lightGray"}
                                color={"mainGreen"}
                                onPress={handleScanDocument}
                                title={"Volver a Escanear"}
                            /> : null}
                        </VStack>
                    </VStack>
                    <HStack px={"20px"} mb={"20px"} justifyContent={"space-between"}>
                        <Button
                            w={"49%"}
                            bg={"lightGray"}
                            color={"mainGreen"}
                            onPress={prevPage}
                            title={"Atras"}
                        />
                        <Button
                            spin={loading}
                            w={"49%"}
                            disabled={disabledButton}
                            bg={disabledButton ? "lightGray" : "mainGreen"}
                            color={disabledButton ? 'placeholderTextColor' : "white"}
                            onPress={async () => {
                                setLoading(true)
                                nextPage()
                                setLoading(false)
                            }}
                            title={"Siguiente"}
                        />
                        <BottomSheet showDragIcon={false} onCloseFinish={() => setOpenBottomSheet(false)} open={openBottomSheet} height={height * 0.9}>
                            <HStack bg={"red"} style={{ width: "100%", height: "100%" }}>
                                <CameraView autofocus='on' style={{ width: "100%", height: "100%" }} facing={"back"}>
                                    <Stack h={"100%"} justifyContent={"flex-end"} pb={"50px"}>
                                        <HStack h={"100px"} w={"100%"} alignItems={"center"} justifyContent={"center"}>
                                            <Pressable borderWidth={4} borderColor={"white"} borderRadius={100} bg={"white"} h={"75px"} w={"75px"} alignItems={"center"} justifyContent={"center"} >
                                                <Stack borderWidth={2} bg={"white"} h={"100%"} w={"100%"} borderRadius={100} />
                                            </Pressable>
                                        </HStack>
                                    </Stack>
                                </CameraView>
                            </HStack>
                        </BottomSheet>
                    </HStack>
                </VStack>
            </TouchableWithoutFeedback>

        </ScrollView>
    );
}


export default ScanID

const styles = StyleSheet.create({
    Shadow: {
        shadowColor: "#fff",
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.25,
        shadowRadius: 1,
        elevation: 1,
    },
    InputsSucess: {
        borderColor: colors.mainGreen,
        borderWidth: 1,
        borderRadius: 10,
    },
    InputsFail: {
        borderColor: colors.alert,
        borderWidth: 1,
        borderRadius: 10,
    }
});

