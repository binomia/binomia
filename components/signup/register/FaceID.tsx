import { useContext, useEffect, useRef, useState } from 'react';
import { VStack, Heading, Text, HStack, Image, ZStack } from 'native-base';
import { StyleSheet, TouchableOpacity, Dimensions, View } from 'react-native';
import colors from '@/colors';
import { TEXT_HEADING_FONT_SIZE, TEXT_PARAGRAPH_FONT_SIZE } from '@/constants';
import Button from '@/components/global/Button';
import { GlobalContext } from '@/contexts/globalContext';
import { GlobalContextType, SessionPropsType } from '@/types';
import BottomSheet from '@/components/global/BottomSheet';
import { SessionContext } from '@/contexts';
import { CameraView } from 'expo-camera';
import { biometric } from '@/assets';
import CircularProgress from 'react-native-circular-progress-indicator';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Camera, useCameraDevice, useCameraPermission, useMicrophonePermission, useFrameProcessor, Frame } from 'react-native-vision-camera';

type Props = {
    nextPage: () => void
    prevPage: () => void
}


const { width, height } = Dimensions.get("window");
const FaceID: React.FC<Props> = ({ nextPage, prevPage }: Props): JSX.Element => {
    const camera = useRef<CameraView>(null);
    const ref = useRef<Camera>(null);
    const { } = useContext<GlobalContextType>(GlobalContext);
    const { } = useContext<SessionPropsType>(SessionContext);
    const [openBottomSheet, setOpenBottomSheet] = useState<boolean>(false);
    const [disabledButton, setDisabledButton] = useState<boolean>(true);
    const [loading, setLoading] = useState<boolean>(false);
    const [images, setImages] = useState<string[]>([]);
    const [progress, setProgress] = useState<number>(0);
    const [recording, setRecording] = useState<boolean>(false);

    const frameProcessor = useFrameProcessor((frame) => {
        'worklet'
        frame.
      }, [])

    const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

    const device = useCameraDevice("front");
    const cameraPermission = useCameraPermission()
    const microphonePermission = useMicrophonePermission()


    const onPressNext = async () => {
        nextPage()
    }


    const stopRecording = async () => {
        if (ref.current) {
            await ref.current.stopRecording()
            setRecording(false)
        }


    }

    const startRecording = async () => {
        if (ref.current) {
            ref.current.startRecording({

                onRecordingFinished: (video) => console.log({ video }),
                onRecordingError: (error) => console.error({ error })
            });



            setRecording(true)
        }
    }


    const takePicture = async () => {
        // await delay(3000);
        if (camera.current) {
            console.log("starting record");

            const video = await camera.current.recordAsync({ maxDuration: 15 });
            console.log(video?.uri);


            setTimeout(() => {
                setOpenBottomSheet(true)
            }, 1000)


            // if (video?.uri) {
            //     const _images = images;
            //     _images.push(video?.uri);

            //     console.log({
            //         images: _images,
            //         progress: Math.floor(_images.length / 5 * 100) // 0 - 100,
            //     });

            //     setImages(_images);
            // }
        }
    }

    useEffect(() => {
        (async () => {
            if (!cameraPermission.hasPermission) {
                await cameraPermission.requestPermission();
            };

            if (!microphonePermission.hasPermission) {
                await microphonePermission.requestPermission();
            };

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


            if (recording) {
                interval = setInterval(() => {
                    const _progress = progress;

                    if (_progress + 6 > 100) {
                        clearInterval(interval);
                        setProgress(100)

                    } else {
                        setProgress(_progress + 6)
                    }

                    console.log(_progress);
                }, 1000);



            }
        })()

        return () => clearInterval(interval);

    }, [recording])

    return (
        <VStack h={height} flex={1} bg={"red.100"} justifyContent={"space-between"}>
            <VStack px={"20px"} bg={"red.100"} h={"50%"}>
                <Heading fontSize={`${TEXT_HEADING_FONT_SIZE - 2}px`} mb={"5px"} mt={"30px"} color={"white"}>Escaneos Biométricos</Heading>
                <Text fontSize={`${TEXT_PARAGRAPH_FONT_SIZE}px`} w={"85%"} color={"white"}>
                    Se escanearán tus datos biométricos para garantizar un acceso seguro y protegido.
                </Text>
                <HStack w={"100%"} alignItems={"center"} justifyContent={"center"}>
                    <TouchableOpacity onPress={() => setOpenBottomSheet(true)}>
                        <Image shadow={5} w={width * 0.7} resizeMode="contain" source={biometric} alt="welcome-screen-image-account" />
                    </TouchableOpacity>
                </HStack>
                <HStack w={"100%"} alignItems={"center"} justifyContent={"center"}>
                    <TouchableOpacity onPress={() => setOpenBottomSheet(true)}>
                        <Image shadow={5} h={"50px"} w={"25px"} resizeMode="contain" source={biometric} alt="welcome-screen-image-account" />
                    </TouchableOpacity>
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
                {images.length !== 5 ?
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
                        disabled={disabledButton}
                        bg={disabledButton ? "lightGray" : "mainGreen"}
                        color={disabledButton ? 'placeholderTextColor' : "white"}
                        onPress={onPressNext}
                        title={"Continuar"}
                    />
                }
                <BottomSheet onCloseFinish={() => setOpenBottomSheet(false)} showDragIcon={false} open={openBottomSheet} height={height * 0.9}>
                    {device &&
                        <ZStack flex={1}>
                            <Camera ref={ref} audio={true} video={true} isActive device={device} style={StyleSheet.absoluteFillObject} />
                            <VStack w={"100%"} h={"100%"} justifyContent={"space-between"} alignItems={"center"} pb={"50px"}>
                                <Heading mt={"20px"} color={"red"}>{progress}%</Heading>
                                <HStack space={20}>
                                    {recording ?
                                        <TouchableOpacity onPress={() => startRecording()}>
                                            <HStack borderColor={"white"} borderWidth={3} bg={"white"} borderRadius={100} style={styles.Shadow}>
                                                <HStack borderColor={"black"} borderWidth={3} borderRadius={100} w={"65px"} h={"65px"} />
                                            </HStack>
                                        </TouchableOpacity>
                                        :
                                        <TouchableOpacity onPress={() => startRecording()}>
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