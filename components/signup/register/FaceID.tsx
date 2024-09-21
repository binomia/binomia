import { useContext, useEffect, useRef, useState } from 'react';
import { VStack, Heading, Text, HStack, Image, Pressable } from 'native-base';
import { Keyboard, StyleSheet, TouchableOpacity, TouchableWithoutFeedback, Dimensions, View, StatusBar } from 'react-native';
import colors from '@/colors';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { phone } from 'phone';
import { FORMAT_CEDULA, FORMAT_PHONE_NUMBER, VALIDATE_EMAIL } from '@/helpers';
import { KeyboardAvoidingScrollView } from '@cassianosch/react-native-keyboard-sticky-footer-avoiding-scroll-view';
import { INPUT_HEIGHT, TEXT_HEADING_FONT_SIZE, TEXT_PARAGRAPH_FONT_SIZE } from '@/constants';
import Input from '@/components/global/Input';
import Button from '@/components/global/Button';
import { GlobalContext } from '@/contexts/globalContext';
import { GlobalContextType, SessionPropsType } from '@/types';
import BottomSheet from '@/components/global/BottomSheet';
import { WebView } from 'react-native-webview';
import { SessionContext } from '@/contexts';
import { gql, useLazyQuery } from '@apollo/client';
import { CameraView } from 'expo-camera';
import AntDesign from '@expo/vector-icons/AntDesign';
import { biometric, biometricOn, welcomeSignup } from '@/assets';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import CircularProgress from 'react-native-circular-progress-indicator';


const UserByEmail = gql`
    query UserByEmail($email: String!) {
  userByEmail(email: $email)
}
`


type Props = {
    nextPage: () => void
    prevPage: () => void
}


const { width, height } = Dimensions.get("window");
const FaceID: React.FC<Props> = ({ nextPage, prevPage }: Props): JSX.Element => {
    const camera = useRef<CameraView>(null);
    const { } = useContext<GlobalContextType>(GlobalContext);
    const { } = useContext<SessionPropsType>(SessionContext);
    const [openBottomSheet, setOpenBottomSheet] = useState<boolean>(false);
    const [disabledButton, setDisabledButton] = useState<boolean>(true);
    const [loading, setLoading] = useState<boolean>(false);
    const [images, setImages] = useState<string[]>([]);

    const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));



    const onPressNext = async () => {
        nextPage()
    }


    const takePicture = async () => {
        if (camera.current) {
            const photo = await camera.current.takePictureAsync();

            if (photo?.uri) {
                setImages([...images, photo.uri]);
                // console.log("photo: ", photo?.uri);
            }
        }
    }

    useEffect(() => {
        (async () => {
            if (openBottomSheet) {
                for (let i = 0; i < 5; i++) {
                    await takePicture()
                    await delay(3000);
                }
                console.log("Done!");
                console.log(images);
                setOpenBottomSheet(false)
            }
        })()
    }, [openBottomSheet])


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
                    <CameraView ref={camera} facing='front' style={{ flex: 1 }}>
                        <VStack flex={1} justifyContent={"flex-end"} alignItems={"center"} pb={"50px"}>
                            <CircularProgress
                                value={100 / (5 - images.length)}
                                radius={50}
                                inActiveStrokeOpacity={0.5}
                                activeStrokeWidth={15}
                                inActiveStrokeWidth={10}
                                
                                // showProgressValue={false}
                                progressValueStyle={{ fontWeight: '100', color: 'white' }}
                                activeStrokeSecondaryColor="yellow"
                                inActiveStrokeColor="black"
                                // duration={5000}
                                dashedStrokeConfig={{
                                    count: 20,
                                    width: 4,
                                }}
                            />
                        </VStack>
                    </CameraView>
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