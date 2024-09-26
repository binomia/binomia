import { useContext, useEffect, useState } from 'react';
import { VStack, Heading, Text, HStack, Image, Pressable, Stack, Box } from 'native-base';
import { Keyboard, TouchableWithoutFeedback, Dimensions, TouchableOpacity, ScrollView } from 'react-native';
import { TEXT_HEADING_FONT_SIZE, TEXT_PARAGRAPH_FONT_SIZE } from '@/constants';
import Button from '@/components/global/Button';
import { idBack } from '@/assets';
import BottomSheet from '@/components/global/BottomSheet';
import { useDocumentScanner } from '@/hooks/useDocumentScan';
import { CameraView } from 'expo-camera';
import { GlobalContext } from '@/contexts/globalContext';
import { GlobalContextType, SessionPropsType } from '@/types';
import { SessionContext } from '@/contexts';

type Props = {
    nextPage: () => void
    prevPage: () => void
}

const { width, height } = Dimensions.get("window");

const ScanBackID: React.FC<Props> = ({ nextPage, prevPage }: Props): JSX.Element => {
    const { setIdBack, idBack: idBackScaned, email } = useContext<GlobalContextType>(GlobalContext);
    const [disabledButton, setDisabledButton] = useState<boolean>(true);
    const [openBottomSheet, setOpenBottomSheet] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const { scanDocument } = useDocumentScanner()


    const handleScanDocument = async () => {
        const image = await scanDocument()
        if (!image) return

        setIdBack(image || "")
    }


    const onPressNext = async () => {
        nextPage()
    }


    useEffect(() => {
        if (idBackScaned)
            setDisabledButton(false)

    }, [idBackScaned])



    return (
        <ScrollView contentContainerStyle={{ flex: 1 }}>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <VStack h={"100%"} w={"100%"} justifyContent={"space-between"}>
                    <VStack pt={"10%"}>
                        <VStack px={"20px"} w={"100%"} alignItems={"flex-start"}>
                            <Heading fontSize={`${TEXT_HEADING_FONT_SIZE - 2}px`} color={"white"}>Cédula - Reverso</Heading>
                            <Text fontSize={`${TEXT_PARAGRAPH_FONT_SIZE}px`} w={"80%"} color={"white"}>
                                Por favor, escanea el reverso de tu cédula para que podamos validar tu identidad.
                            </Text>
                        </VStack>
                        <VStack w={width} h={"52%"} px={"30px"} mt={"30px"} alignItems={"center"} >
                            <TouchableOpacity onPress={handleScanDocument} style={{ width: "100%", height: "100%" }}>
                                <Box shadow={7} w={"100%"} h={"100%"}>
                                    <Image w={"100%"} h={"100%"} alt='idBackScaned-image' resizeMode="contain" source={idBackScaned ? { uri: idBackScaned } : idBack} />
                                </Box>
                            </TouchableOpacity>
                            {idBackScaned ? <Button
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
                            onPress={onPressNext}
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


export default ScanBackID