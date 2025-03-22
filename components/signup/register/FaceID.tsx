import { useContext, useEffect, useState } from 'react';
import { VStack, Heading, Text, HStack, Spinner, ZStack } from 'native-base';
import { TouchableOpacity, Dimensions, Image } from 'react-native';
import colors from '@/colors';
import { TEXT_HEADING_FONT_SIZE, TEXT_PARAGRAPH_FONT_SIZE } from '@/constants';
import Button from '@/components/global/Button';
import { SessionPropsType } from '@/types';
import { SessionContext } from '@/contexts/sessionContext';
import { biometric, biometricError, biometricOn } from '@/assets';
import AntDesign from '@expo/vector-icons/AntDesign';
import { registerActions } from '@/redux/slices/registerSlice';
import { useDispatch, useSelector } from 'react-redux';
import CameraComponent from '@/components/global/Camera';
import { useCloudinary } from '@/hooks/useCloudinary';

type Props = {
    nextPage: () => void
    prevPage: () => void
    reRenderPage: <T> (state?: T) => void
}


const { width, height } = Dimensions.get("window");
const FaceID: React.FC<Props> = ({ nextPage, prevPage }: Props): JSX.Element => {
    const dispatch = useDispatch()
    const state = useSelector((state: any) => state.registerReducer)
    const { sendVerificationCode, setVerificationData } = useContext<SessionPropsType>(SessionContext);
    const [openBottomSheet, setOpenBottomSheet] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [videoUrl, setVideoUrl] = useState<string>("");
    const [error, setError] = useState<boolean>(false);
    const [isVideoFinishedUploaded, setIsVideoFinishedUploaded] = useState<boolean>(false);
    const { uploadVideo } = useCloudinary()



    const onPressNext = async () => {
        try {
            setLoading(true)
            const message = await sendVerificationCode(state.email.toLowerCase())

            if (message)
                setVerificationData({ ...message, email: state.email.toLowerCase() })

            nextPage()
            setLoading(false)

        } catch (_: any) {
            setLoading(false)
            setError(true)
        }
    }

    useEffect(() => {
        (async () => {
            try {
                setError(true)
                setIsVideoFinishedUploaded(false)
                if (videoUrl) {
                    const secure_url = await uploadVideo(videoUrl)

                    dispatch(registerActions.setFaceVideoUrl(secure_url))

                    setError(false)
                    setOpenBottomSheet(false)
                    setLoading(false)
                    setIsVideoFinishedUploaded(true)
                }

                // eslint-disable-next-line @typescript-eslint/no-unused-vars
            } catch (error) {
                setOpenBottomSheet(false)
                setIsVideoFinishedUploaded(true)
                setError(true)
                setLoading(false)
            }
        })()
    }, [videoUrl])


    return (
        <VStack h={height} flex={1} bg={"red.100"} justifyContent={"space-between"}>
            <VStack px={"20px"} bg={"red.100"} h={"50%"} bgColor={"red.100"}>
                <Heading fontSize={`${TEXT_HEADING_FONT_SIZE - 2}px`} mb={"5px"} mt={"30px"} color={"white"}>Escaneos Biométricos</Heading>
                <Text fontSize={`${TEXT_PARAGRAPH_FONT_SIZE}px`} w={"85%"} color={"white"}>
                    Se escanearán tus datos biométricos para garantizar un acceso seguro y protegido.
                </Text>
                <HStack w={"100%"} alignItems={"center"} justifyContent={"center"}>
                    <TouchableOpacity disabled={!!videoUrl} onPress={async () => setOpenBottomSheet(true)}>
                        {videoUrl && !error && isVideoFinishedUploaded ?
                            <Image style={{ width: width * 0.7, height: height * 0.5 }} resizeMode="contain" source={biometricOn} alt="welcome-screen-image-account" />
                            : error && isVideoFinishedUploaded ?
                                <Image style={{ width: width * 0.7, height: height * 0.5 }} resizeMode="contain" source={biometricError} alt="welcome-screen-image-account" />
                                :
                                <ZStack w={"100%"} h={"100%"} justifyContent={"center"} alignItems={"center"}>
                                    <Image style={{ width: width * 0.7, height: height * 0.5 }} resizeMode="contain" source={biometric} alt="welcome-screen-image-account" />
                                    {loading ? <Spinner position={"relative"} left={"-28px"} size={"lg"} color={colors.mainGreen} /> : null}
                                </ZStack>
                        }
                    </TouchableOpacity>
                </HStack>
                {videoUrl && !error && isVideoFinishedUploaded ? <HStack space={2} w={"100%"} justifyContent={"center"}>
                    <AntDesign style={{ marginTop: 5 }} name="exclamationcircleo" size={24} color={colors.mainGreen} />
                    <Text fontSize={`${TEXT_PARAGRAPH_FONT_SIZE}px`} w={"80%"} color={"white"}>
                        Los datos biométricos han sido escaneados con éxito, y ahora puedes continuar con tu registro.
                    </Text>
                </HStack>
                    : error && videoUrl && isVideoFinishedUploaded ?
                        <HStack space={2} w={"100%"} justifyContent={"center"}>
                            <AntDesign style={{ marginTop: 5 }} name="exclamationcircleo" size={24} color={colors.red} />
                            <Text fontSize={`${TEXT_PARAGRAPH_FONT_SIZE}px`} w={"80%"} color={"white"}>
                                Haz ocurrido un error al escanear los datos biométricos por favor vuelve a intentarlo.
                            </Text>
                        </HStack> :
                        null
                }
            </VStack>
            <HStack h={"70px"} px={"20px"} justifyContent={"space-between"}>
                <Button
                    w={"49%"}
                    bg={"lightGray"}
                    color={"mainGreen"}
                    onPress={prevPage}
                    title={"Atras"}
                />
                {!videoUrl && !isVideoFinishedUploaded || videoUrl && error ?
                    <Button
                        spin={loading}
                        w={"49%"}
                        bg={"lightGray"}
                        color={error && isVideoFinishedUploaded ? "red" : "mainGreen"}
                        onPress={() => setOpenBottomSheet(true)}
                        title={"Escanear"}
                    />
                    :
                    <Button
                        spin={loading}
                        w={"49%"}
                        bg={loading ? "lightGray" : "mainGreen"}
                        color={"white"}
                        onPress={onPressNext}
                        title={"Continuar"}
                    />
                }
                <CameraComponent
                    video={true}
                    cameraType='front'
                    open={openBottomSheet}
                    onCloseFinish={() => setOpenBottomSheet(false)}
                    setVideo={(video) => {
                        setLoading(true)
                        setIsVideoFinishedUploaded(false)
                        setError(true)
                        setVideoUrl(video)
                    }}
                />
            </HStack>
        </VStack>
    );
}


export default FaceID
