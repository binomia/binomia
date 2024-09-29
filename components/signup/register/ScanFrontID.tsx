import { useEffect, useState } from 'react';
import { VStack, Heading, Text, HStack, Image, Box, ZStack, Spinner } from 'native-base';
import { Keyboard, TouchableWithoutFeedback, Dimensions, TouchableOpacity, ScrollView } from 'react-native';
import { TEXT_HEADING_FONT_SIZE, TEXT_PARAGRAPH_FONT_SIZE } from '@/constants';
import { idFront } from '@/assets';
import Button from '@/components/global/Button';
import { registerActions } from '@/redux/slices/registerSlice';
import { useDispatch, useSelector } from 'react-redux';
import CameraComponent from '@/components/global/Camera';
import { useOCRSpace } from '@/hooks/useOCRSpace';
import { useCloudinary } from '@/hooks/useCloudinary';
import AntDesign from '@expo/vector-icons/AntDesign';
import colors from '@/colors';
import moment from 'moment';


type Props = {
    nextPage: () => void
    prevPage: () => void
}

const { width } = Dimensions.get("window");

const ScanID: React.FC<Props> = ({ nextPage, prevPage }: Props): JSX.Element => {
    const dispatch = useDispatch()
    const state = useSelector((state: any) => state.registerReducer)
    const [disabledButton, setDisabledButton] = useState<boolean>(true);
    const [loading, setLoading] = useState<boolean>(false);
    const [openCamera, setOpenCamera] = useState<boolean>(false);
    const [isInValidIdImageMessage, setIsInValidIdImageMessage] = useState<string>("");
    const [imageUrl, setImageUrl] = useState<string>("");
    const { validateIDImage } = useOCRSpace();
    const { uploadImage } = useCloudinary();


    // {
    //     "name": "JOSE ALBERTO FONDEUR ROSARIO",
    //     "idNumber": "001-1276244-8",
    //     "placeOfBirth": "santo domingo, d.n.",
    //     "dateOfBirth": "1980-01-29",
    //     "dateOfExpiration": "2024-01-29",
    //     "occupation": "empresario (a)",
    //     "maritalStatus": "soltero",
    //     "gender": "m",
    //     "bloodType": "A+"
    // }

    // {
    //     "faceVideoUrl": "",
    //     "fullName": "",
    //     "phone": "",
    //     "username": "",
    //     "email": "",
    //     "dni": "001-06867-6",
    //     "sex": "",
    //     "address": "",
    //     "dob": "",
    //     "dniExpiration": "",
    //     "imageUrl": "",
    //     "password": "",
    //     "addressAgreement": false,
    //     "userAgreement": false,
    //     "idBackUrl": "",
    //     "idFrontUrl": "file:///var/mobile/Containers/Data/Application/C61C11E2-E863-4D4B-994C-44238A2C1FB3/Library/Caches/ImageManipulator/4A3E2349-4E13-4F59-827B-3B6ABFFA8AD7.jpg"
    // }

    const validateIDImageOCR = async (data: any) => {
        try {
            setDisabledButton(false)

            if (data["idNumber"] !== state.dni) {
                setIsInValidIdImageMessage("La cédula escaneada no coincide con el numero de cédula ingresado previamente")
                setDisabledButton(true)
            }

            if (data["dateOfBirth"] !== state.dob) {
                setIsInValidIdImageMessage("La cédula escaneada no coincide con la fecha de nacimiento ingresada previamente")
                setDisabledButton(true)
            }

            if (moment(data["dateOfExpiration"]).isBefore(moment())) {
                console.log("expire dni");
                setIsInValidIdImageMessage("La cédula escaneada ya expiro por favor escanea una nueva que no haya expirado")
                setDisabledButton(true)
            }

            console.log(data["name"], state.fullName);
            
            if (!data["name"].includes(state.fullName)) {               
                setIsInValidIdImageMessage("La cédula escaneada coincide con el nombre ingresado previamente")
                setDisabledButton(true)
            }


        } catch (error) {

        }
    }


    useEffect(() => {
        if (imageUrl) {
            (async () => {
                try {
                    setLoading(true)
                    setOpenCamera(false);

                    const _imageUrl = await uploadImage(imageUrl)
                    const ocrData = await validateIDImage(_imageUrl)

                    await validateIDImageOCR(ocrData)

                    dispatch(registerActions.setIdFrontUrl(imageUrl))
                    setLoading(false)

                    console.log(JSON.stringify(ocrData, null, 2));

                } catch (error) {
                    console.error(error)
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
                            <Heading fontSize={`${TEXT_HEADING_FONT_SIZE - 2}px`} color={"white"}>Cédula - Frontal</Heading>
                            <Text fontSize={`${TEXT_PARAGRAPH_FONT_SIZE}px`} w={"80%"} color={"white"}>
                                Para validar tu identidad, por favor, escanea la parte frontal de tu cédula.
                            </Text>
                        </VStack>
                        <VStack w={width} h={"52%"} px={"30px"} mt={"30px"} alignItems={"center"} >
                            <TouchableOpacity onPress={() => setOpenCamera(true)} style={{ width: "100%", height: "100%" }}>
                                <Box shadow={7} w={"100%"} h={"100%"}>
                                    <ZStack w={"100%"} h={"100%"} alignItems={"center"} justifyContent={"center"}>
                                        <Image alt='id-front-scan' w={"100%"} h={"100%"} resizeMode="contain" source={imageUrl && !loading ? { uri: imageUrl } : idFront} />
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
                            onPress={async () => {
                                setLoading(true)
                                nextPage()
                                setLoading(false)
                            }}
                            title={"Siguiente"}
                        />
                    </HStack>
                    <CameraComponent setImage={setImageUrl} open={openCamera} onCloseFinish={() => setOpenCamera(false)} />
                </VStack>
            </TouchableWithoutFeedback>
        </ScrollView>
    );
}


export default ScanID