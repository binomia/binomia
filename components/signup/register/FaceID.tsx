import { useContext, useEffect, useRef, useState } from 'react';
import { VStack, Heading, Text, HStack, ZStack } from 'native-base';
import { StyleSheet, TouchableOpacity, Dimensions, Image } from 'react-native';
import colors from '@/colors';
import { TEXT_HEADING_FONT_SIZE, TEXT_PARAGRAPH_FONT_SIZE, OCR_SPACE_API_KEY } from '@/constants';
import Button from '@/components/global/Button';
import { GlobalContext } from '@/contexts/globalContext';
import { GlobalContextType, SessionPropsType } from '@/types';
import BottomSheet from '@/components/global/BottomSheet';
import { SessionContext } from '@/contexts';
import { useOCRSpace } from '@/hooks/useOCRSpace';
import { biometric, biometricOn } from '@/assets';
import { useCameraDevice, useCameraPermission, useMicrophonePermission, useFrameProcessor, Camera, Frame } from 'react-native-vision-camera';
import { Face, FaceDetectionOptions, useFaceDetector } from 'react-native-vision-camera-face-detector'
import { Worklets } from 'react-native-worklets-core';
import { crop } from 'vision-camera-cropper';
import Fade from "react-native-fade";
import AntDesign from '@expo/vector-icons/AntDesign';
import { registerActions } from '@/redux/slices/registerSlice';
import { useDispatch } from 'react-redux';

type Props = {
    nextPage: () => void
    prevPage: () => void
    reRenderPage: <T> (state?: T) => void
}


const { width, height } = Dimensions.get("window");
const FaceID: React.FC<Props> = ({ nextPage, prevPage, reRenderPage }: Props): JSX.Element => {
    const dispatch = useDispatch()
    const ref = useRef<Camera>(null);
    const { email } = useContext<GlobalContextType>(GlobalContext);
    const { sendVerificationCode, setVerificationData } = useContext<SessionPropsType>(SessionContext);
    const [openBottomSheet, setOpenBottomSheet] = useState<boolean>(false);
    const [disabledButton, setDisabledButton] = useState<boolean>(true);
    const [loading, setLoading] = useState<boolean>(false);
    const [images, setImages] = useState<string[]>([]);
    const [video, setVideo] = useState<string>("");
    const [progress, setProgress] = useState<number>(5);
    const [recording, setRecording] = useState<boolean>(false);
    const [fade, setFade] = useState(false);

    const device = useCameraDevice("front");
    const faceDetectionOptions = useRef<FaceDetectionOptions>({}).current
    const { detectFaces } = useFaceDetector(faceDetectionOptions)
    const { extractTextFromImage, validateIDImage } = useOCRSpace()


    const handleDetectedFaces = Worklets.createRunOnJS((faces: Face[], frame: Frame) => {
        if (faces.length > 0) {
            setDisabledButton(false)

            // console.log("handleDetectedFaces", faces.length);
            // const cropRegion = {
            //     left: 10,   
            //     top: 10,
            //     width: 80,
            //     height: 30
            // }

            // const result = crop(frame, { cropRegion, includeImageBase64: true, saveAsFile: false });
            // console.log("image", result);


            // if (result.base64) {
            //     saveImages(result.base64)
            // }
        }

    })

    const frameProcessor = useFrameProcessor((frame) => {
        'worklet'
        const faces = detectFaces(frame)

        if (faces.length > 0) {
            faces[0].bounds
        }

        handleDetectedFaces(faces, frame)

    }, [])

    const onPressNext = async () => {
        try {
            setLoading(true)
            const message = await sendVerificationCode(email.toLowerCase())

            if (message)
                setVerificationData({ ...message, email: email.toLowerCase() })

            nextPage()
            setLoading(false)

        } catch (error) {
            console.error(error);
            setLoading(false)
        }
    }

    const takePicture = async () => {
        if (ref.current) {
            const photo = await ref.current.takePhoto();
            console.log("photo", photo);
        }
    }

    const startRecording = async () => {
        if (ref.current) {
            ref.current.startRecording({
                onRecordingFinished: (video) => {
                    setVideo(video.path)
                    dispatch(registerActions.setFaceVideoUrl(video.path))
                },
                onRecordingError: (error) => console.error(error)
            });
        }
        setRecording(true)
    }

    const stopRecording = async () => {
        if (ref.current) {
            await ref.current.stopRecording();
        }

        setRecording(false)
        setProgress(0)
    }

    const onCloseFinish = () => {
        setOpenBottomSheet(false)
        setImages([])
        setProgress(5)
        setFade(false)
    }

    const extractText = async () => {
        const idData = await validateIDImage("https://pbs.twimg.com/media/CIHaxr5UsAAdnFK.jpg")
        console.log(JSON.stringify(idData, null, 2));
    }

    useEffect(() => {
        (async () => {
            if (openBottomSheet) {
                console.log("openBottomSheet", openBottomSheet);
                setImages([])

                // while (openBottomSheet) {
                //     await takePicture()
                // }

                // setOpenBottomSheet(false)
            }
        })()
    }, [openBottomSheet])

    useEffect(() => {
        let interval: NodeJS.Timeout;
        (async () => {
            let s = 5
            if (recording) {
                setFade(true)
                interval = setInterval(() => {
                    s = s - 1
                    setFade(false)
                    setProgress(s)
                    setFade(true)

                    if (s === 0) {
                        clearInterval(interval);
                        setRecording(false)
                        setProgress(0)
                        setOpenBottomSheet(false)
                        stopRecording()
                    }

                }, 1500);
            }
        })()

        return () => clearInterval(interval);

    }, [recording])


    return (
        <VStack h={height} flex={1} bg={"red.100"} justifyContent={"space-between"}>
            <VStack px={"20px"} bg={"red.100"} h={"50%"} bgColor={"red.100"}>
                <Heading fontSize={`${TEXT_HEADING_FONT_SIZE - 2}px`} mb={"5px"} mt={"30px"} color={"white"}>Escaneos Biométricos</Heading>
                <Text fontSize={`${TEXT_PARAGRAPH_FONT_SIZE}px`} w={"85%"} color={"white"}>
                    Se escanearán tus datos biométricos para garantizar un acceso seguro y protegido.
                </Text>
                <HStack w={"100%"} alignItems={"center"} justifyContent={"center"}>
                    <TouchableOpacity disabled={!!video} onPress={async () => extractText()}>
                        {video ?
                            <Image style={{ width: width * 0.7, height: height * 0.5 }} resizeMode="contain" source={biometricOn} alt="welcome-screen-image-account" />
                            :
                            <Image style={{ width: width * 0.7, height: height * 0.5 }} resizeMode="contain" source={biometric} alt="welcome-screen-image-account" />
                        }
                    </TouchableOpacity>
                </HStack>
                <HStack space={2} w={"100%"} justifyContent={"center"}>
                    <AntDesign style={{ marginTop: 5 }} name="exclamationcircleo" size={24} color={colors.mainGreen} />
                    <Text fontSize={`${TEXT_PARAGRAPH_FONT_SIZE}px`} w={"80%"} color={"white"}>
                        Los datos biométricos han sido escaneados con éxito, y ahora puedes continuar con tu registro.
                    </Text>
                </HStack>
            </VStack>
            <HStack h={"70px"} px={"20px"} justifyContent={"space-between"}>
                <Button
                    w={"49%"}
                    bg={"lightGray"}
                    color={"mainGreen"}
                    onPress={prevPage}
                    title={"Atras"}
                />
                {!video ?
                    <Button
                        w={"49%"}
                        bg={"lightGray"}
                        color={"mainGreen"}
                        onPress={() => setOpenBottomSheet(true)}
                        title={"Escanear"}
                    />
                    :
                    <Button
                        spin={loading}
                        w={"49%"}
                        bg={"mainGreen"}
                        color={"white"}
                        onPress={onPressNext}
                        title={"Continuar"}
                    />
                }

                <BottomSheet onCloseFinish={() => onCloseFinish()} showDragIcon={false} open={openBottomSheet} height={height * 0.9}>
                    {device &&
                        <ZStack flex={1}>
                            <Camera
                                ref={ref}
                                photo={true}
                                video={true}
                                style={StyleSheet.absoluteFillObject}
                                device={device}
                                frameProcessor={frameProcessor}
                                pixelFormat="rgb"
                                isActive
                            />
                            <VStack w={"100%"} h={"100%"} justifyContent={"space-between"} alignItems={"center"} pb={"50px"}>
                                <HStack position={"absolute"} top={"60%"}>
                                    <Fade visible={fade} direction="up">
                                        <Heading opacity={0.5} fontSize={`${width / 2.2}px`} mt={"20px"} color={"red"}>{progress}</Heading>
                                    </Fade>
                                </HStack>
                                <HStack space={20}>
                                    {!recording ?
                                        <TouchableOpacity onPress={() => takePicture()}>
                                            <HStack borderColor={"white"} borderWidth={3} bg={"white"} borderRadius={100} style={styles.Shadow}>
                                                <HStack borderColor={"black"} borderWidth={3} borderRadius={100} w={"65px"} h={"65px"} />
                                            </HStack>
                                        </TouchableOpacity>
                                        :
                                        <TouchableOpacity onPress={() => console.log(video)}>
                                            <HStack borderColor={"white"} borderWidth={3} w={"65px"} h={"65px"} borderRadius={100} justifyContent={"center"} alignItems={"center"} style={styles.Shadow}>
                                                <HStack bg={"red"} borderRadius={"5px"} w={"25px"} h={"25px"} />
                                            </HStack>
                                        </TouchableOpacity>
                                    }
                                </HStack>
                            </VStack>
                        </ZStack>

                    }
                </BottomSheet>
            </HStack>
        </VStack>
    );
}


export default FaceID


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