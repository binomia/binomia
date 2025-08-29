import { useContext, useEffect, useRef, useState } from 'react';
import { VStack, Heading, HStack, Text, Stack } from 'native-base';
import { SafeAreaView, TouchableOpacity, TouchableWithoutFeedback, Keyboard, StyleSheet } from 'react-native';
import { SessionContext } from '@/contexts/sessionContext';
import { SessionPropsType } from '@/types';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import colors from '@/colors';
import { INPUT_HEIGHT, SCREEN_HEIGHT, TEXT_HEADING_FONT_SIZE, TEXT_PARAGRAPH_FONT_SIZE } from '@/constants';
import { VALIDATE_EMAIL } from '@/helpers';
import PagerView from 'react-native-pager-view';
import AccountRecovered from './AccountRecovered';
import Input from '@/components/global/Input';
import Button from '@/components/global/Button';
import BottomSheet from '@/components/global/BottomSheet';
import ForgotPassword from './ForgotPassword';
import VerifyCode from './VerifyCode';
import ChangePassword from './ChangePassword';

const LoginComponent: React.FC = (): JSX.Element => {

    const pageViewRef = useRef<PagerView>(null);
    const pageRef = useRef<PagerView>(null);
    const { onLogin, setVerificationData, setVerificationCode, sendVerificationCode, invalidCredentials, setInvalidCredentials } = useContext<SessionPropsType>(SessionContext);
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [disabledButton, setDisabledButton] = useState<boolean>(true);
    const [showResetPasswordBottomSheet, setShowResetPasswordBottomSheet] = useState<boolean>(false);
    const [currentPage, setCurrentPage] = useState<number>(0);

    const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));



    const nextPage = () => {
        if (currentPage === 3) {
            pageViewRef.current?.setPage(0)
            setCurrentPage(0)

        } else
            pageViewRef.current?.setPage(currentPage + 1)

        setCurrentPage(currentPage + 1)
    }


    const prevPage = () => {
        if (currentPage === 0) {
            pageViewRef.current?.setPage(0)
            setCurrentPage(0)

        } else
            pageViewRef.current?.setPage(currentPage - 1)

        setCurrentPage(currentPage - 1)
    }

    const cancelBottomSheet = async () => {
        setVerificationCode('')
        setShowResetPasswordBottomSheet(false)

        await delay(1500)
        setCurrentPage(0)
        pageViewRef.current?.setPage(0)
    }

    const sendCode = async () => {
        try {
            setLoading(true)
            const message = await sendVerificationCode(email.toLowerCase())

            if (message)
                setVerificationData({ ...message, email: email.toLowerCase() })


            pageRef.current?.setPage(1) 
            setLoading(false)

        } catch (error: any) {
            console.error(error.toString());
            setLoading(false)
        }
    }

    const onLoginPress = async () => {
        try {
            setLoading(true)

            await onLogin({ email: email.toLowerCase(), password }) 
            await sendCode()  

            // await Updates.reloadAsync();
            setLoading(false)
        } catch (error: any) {
            console.error(error.toString());
            setLoading(false)
        }
    }


    useEffect(() => {
        setInvalidCredentials(false)
        setDisabledButton(true)

        if (email && password && VALIDATE_EMAIL(email) && password.length >= 6) {
            if (VALIDATE_EMAIL(email))
                setDisabledButton(false)
        }

    }, [email, password])


    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.darkGray }}>
            <PagerView scrollEnabled={false} ref={pageRef} style={{ flex: 1 }} initialPage={1}>
                <TouchableWithoutFeedback key={"0"} onPress={Keyboard.dismiss}>
                    <VStack w={"100%"} px={"20px"} variant={"body"} mt={"30px"} justifyContent={"space-between"} h={"100%"}>
                        <VStack alignItems={"center"}>
                            <VStack w={"100%"} mb={"50px"}>
                                <Heading fontSize={`${TEXT_HEADING_FONT_SIZE}px`} mb={"5px"} color={"white"}>Iniciar Sesión</Heading>
                                <Text fontSize={`${TEXT_PARAGRAPH_FONT_SIZE}px`} w={"90%"} color={"white"}>
                                    Gestiona tu dinero de manera segura, eficiente y sin complicaciones.
                                </Text>
                            </VStack>
                            <Input
                                keyboardType='email-address'
                                h={`${INPUT_HEIGHT}px`}
                                style={VALIDATE_EMAIL(email) && !invalidCredentials ? styles.InputsSucess : email && !invalidCredentials ? styles.InputsFail : {}}
                                value={email}
                                onChangeText={(e) => setEmail(e.trim().toLowerCase())}
                                placeholder="Correo Electronico*"
                            />
                            <Stack borderRadius={"10px"} my={"5px"} borderWidth={invalidCredentials ? 0 : 1} borderColor={password.length >= 6 ? colors.mainGreen : password ? colors.alert : "transparent"} w={"100%"}>
                                <Input
                                    m={"0px"}
                                    h={`${INPUT_HEIGHT}px`}
                                    isInvalid={invalidCredentials}
                                    errorMessage='La contraseña y correo electronico no coinciden'
                                    secureTextEntry={!showPassword}
                                    onChangeText={(e) => setPassword(e)}
                                    placeholder="Contraseña*"
                                    rightElement={
                                        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                            <HStack mr={"15px"}>
                                                <MaterialCommunityIcons name={showPassword ? "eye-outline" : "eye-off-outline"} size={20} color={password.length && !invalidCredentials ? colors.mainGreen : password && !invalidCredentials ? colors.alert : "gray"} />
                                            </HStack>
                                        </TouchableOpacity>
                                    }
                                />
                            </Stack>
                            <TouchableOpacity style={{ alignSelf: "flex-end" }} onPress={() => setShowResetPasswordBottomSheet(true)}>
                                <Text underline fontSize={`${TEXT_PARAGRAPH_FONT_SIZE}px`} alignSelf={"flex-end"} fontWeight={"medium"} mt={"10px"} textAlign={"right"} color={"white"}>Olvidaste tu contraseña?</Text>
                            </TouchableOpacity>
                        </VStack>
                        <VStack w={"100%"} alignItems={"center"} mb={"25px"}>
                            <Button
                                spin={loading}
                                disabled={disabledButton}
                                bg={disabledButton ? "lightGray" : "mainGreen"}
                                color={disabledButton ? 'placeholderTextColor' : "white"}
                                w={"100%"}
                                onPress={onLoginPress}
                                title={"Iniciar Sesión"}
                            />
                        </VStack>
                    </VStack>
                </TouchableWithoutFeedback>
                <VerifyCode  key="2" nextPage={nextPage} prevPage={() => pageRef.current?.setPage(0)} />
            </PagerView>

            <BottomSheet onCloseFinish={() => setShowResetPasswordBottomSheet(false)} height={SCREEN_HEIGHT * 0.9} open={showResetPasswordBottomSheet}>
                <PagerView scrollEnabled={false} ref={pageViewRef} style={{ flex: 1 }} initialPage={currentPage}>
                    <ForgotPassword key="1" nextPage={nextPage} />
                    <VerifyCode key="2" nextPage={nextPage} prevPage={prevPage} />
                    <ChangePassword key="3" cancelBottomSheet={cancelBottomSheet} nextPage={nextPage} prevPage={prevPage} />
                    <AccountRecovered key="4" cancelBottomSheet={cancelBottomSheet} />
                </PagerView>
            </BottomSheet>
        </SafeAreaView>

    );
}


export default LoginComponent


const styles = StyleSheet.create({
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