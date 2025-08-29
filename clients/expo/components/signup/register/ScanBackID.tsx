import { useEffect, useState } from 'react';
import { VStack, Heading, Text, HStack, Image, Box, Spinner, ZStack } from 'native-base';
import { Keyboard, TouchableWithoutFeedback, Dimensions, TouchableOpacity, ScrollView } from 'react-native';
import { TEXT_HEADING_FONT_SIZE, TEXT_PARAGRAPH_FONT_SIZE } from '@/constants';
import { idBack } from '@/assets';
import { registerActions } from '@/redux/slices/registerSlice';
import { useDispatch, useSelector } from 'react-redux';
import Button from '@/components/global/Button';
import CameraComponent from '@/components/global/Camera';
import { useOCRSpace } from '@/hooks/useOCRSpace';
import { useCloudinary } from '@/hooks/useCloudinary';
import AntDesign from '@expo/vector-icons/AntDesign';
import colors from '@/colors';


type Props = {
    nextPage: () => void
    prevPage: () => void
}

const { width } = Dimensions.get("window");

const ScanBackID: React.FC<Props> = ({ nextPage, prevPage }: Props): JSX.Element => {
    const dispatch = useDispatch()
    const state = useSelector((state: any) => state.registerReducer)
    const [disabledButton, setDisabledButton] = useState<boolean>(true);
    const [loading, setLoading] = useState<boolean>(false);
    const [imageUrl, setImageUrl] = useState<string>("");
    const [openCamera, setOpenCamera] = useState<boolean>(false);
    const [isInValidIdImageMessage, setIsInValidIdImageMessage] = useState<string>("");
    const { validateIDImage } = useOCRSpace();
    const { uploadImage } = useCloudinary();


    const onPressNext = async () => {
        setLoading(true)
        nextPage()
        setLoading(false)
    }

    useEffect(() => {
        if (imageUrl) {
            (async () => {
                try {
                    setLoading(true)
                    setOpenCamera(false);

                    const _imageUrl = await uploadImage(imageUrl)
                    dispatch(registerActions.setIdBackUrl(_imageUrl))

                    const ocrData = await validateIDImage(_imageUrl)


                    if (ocrData["idNumber"] !== state.dniNumber) {
                        setIsInValidIdImageMessage("La cédula escaneada no coincide con el numero de cédula de la cedula de frontal")
                        setDisabledButton(true)

                    } else {
                        setDisabledButton(false)
                    }

                    setLoading(false)

                } catch (_error: any) {
                    setLoading(false)
                }
            })()
        }

    }, [imageUrl])



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
                            <TouchableOpacity onPress={() => setOpenCamera(true)} style={{ width: "100%", height: "100%" }}>
                                <Box shadow={7} w={"100%"} h={"100%"}>
                                    <ZStack w={"100%"} h={"100%"} alignItems={"center"} justifyContent={"center"}>
                                        <Image w={"100%"} h={"100%"} alt='idBackScaned-image' resizeMode="contain" source={imageUrl && !loading ? { uri: imageUrl } : idBack} />
                                        {loading ? <Spinner size={"lg"} color={"mainGreen"} position={"absolute"} /> : null}
                                    </ZStack>
                                </Box>
                            </TouchableOpacity>
                            {imageUrl ? <Button
                                mt={"10px"}
                                w={"60%"}
                                bg={"lightGray"}
                                color={isInValidIdImageMessage ? "red" : "mainGreen"}
                                onPress={() => {
                                    setImageUrl("")
                                    setOpenCamera(true)
                                    setIsInValidIdImageMessage("")
                                }}
                                title={"Volver a Escanear"}
                            /> : null}
                            {isInValidIdImageMessage ? <HStack mt={"30px"} space={2} w={"100%"} justifyContent={"center"}>
                                <AntDesign style={{ marginTop: 5 }} name="exclamationcircleo" size={24} color={colors.red} />
                                <Text fontSize={`${TEXT_PARAGRAPH_FONT_SIZE}px`} w={"80%"} color={"white"}>{isInValidIdImageMessage}</Text>
                            </HStack> : null}
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
                        <CameraComponent setImage={setImageUrl} open={openCamera} onCloseFinish={() => setOpenCamera(false)} />
                    </HStack>
                </VStack>
            </TouchableWithoutFeedback>

        </ScrollView>
    );
}


export default ScanBackID