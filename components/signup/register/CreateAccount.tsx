import { useContext, useEffect, useState } from 'react';
import { VStack, Heading, Text, HStack, Stack } from 'native-base';
import { Keyboard, StyleSheet, TouchableOpacity, TouchableWithoutFeedback, Dimensions } from 'react-native';
import colors from '@/colors';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { phone } from 'phone';
import { FORMAT_PHONE_NUMBER, VALIDATE_EMAIL } from '@/helpers';
import { KeyboardAvoidingScrollView } from '@cassianosch/react-native-keyboard-sticky-footer-avoiding-scroll-view';
import { INPUT_HEIGHT, TEXT_HEADING_FONT_SIZE, TEXT_PARAGRAPH_FONT_SIZE } from '@/constants';
import Input from '@/components/global/Input';
import Button from '@/components/global/Button';
import { GlobalContext } from '@/contexts/globalContext';
import { GlobalContextType, SessionPropsType } from '@/types';
import BottomSheet from '@/components/global/BottomSheet';
import { WebView } from 'react-native-webview';
import { SessionContext } from '@/contexts';
import { useLazyQuery } from '@apollo/client';
import { UserApolloQueries } from '@/apollo/query';


type Props = {
    nextPage: () => void
}


const { width, height } = Dimensions.get("window");
const CreateAccount: React.FC<Props> = ({ nextPage }: Props): JSX.Element => {
    const { email, setEmail, password, setPassword, names, setNames, lastNames, setLastNames, phoneNumber, setPhoneNumber, userAgreement, setUserAgreement } = useContext<GlobalContextType>(GlobalContext);
    const { sendVerificationCode, setVerificationData } = useContext<SessionPropsType>(SessionContext);
    const [getUserByEmail] = useLazyQuery(UserApolloQueries.userByEmail());

    const [showEmailError, setShowEmailError] = useState<boolean>(false);
    const [showPasswordError, setShowPasswordError] = useState<boolean>(false);
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [disabledButton, setDisabledButton] = useState<boolean>(true);
    const [openBottomSheetUrl, setOpenBottomSheetUrl] = useState<string>("");


    // const sendCode = async () => {
    //     try {
    //         const message = await sendVerificationCode(email.toLowerCase())

    //         if (message) {
    //             setVerificationData({ ...message, email: email.toLowerCase() })
    //             nextPage()
    //         }

    //     } catch (error: any) {
    //         console.error(error.toString());
    //     }
    // }


    // const verifyUserEmail = async (_email: string) => {
    //     try {
    //         const user = await getUserByEmail({ variables: { email: email.toLowerCase() } })
    //         setShowEmailError(user.data.userByEmail)

    //     } catch (error) {
    //         console.error(error);
    //     }
    // }


    const openTermsAndConditions = (url: string) => {
        const urls: { [key: string]: string } = {
            "userAgreement": "https://www.google.com",
            "privacyPolicy": "https://www.google.com",
        }
        setOpenBottomSheetUrl(urls[url])
    }

    const isAValidPhoneNumber = (value: string) => {
        const { isValid } = phone(value, { country: "DO" });
        return isValid
    };

    // useEffect(() => {
    //     if (VALIDATE_EMAIL(email))
    //         verifyUserEmail(email)

    // }, [email])

    useEffect(() => {
        if (password.length >= 6) {
            console.log("password", password);

            setShowPasswordError(true)
        }

    }, [password])

    useEffect(() => {
        setDisabledButton(true)

        if (names.length >= 2 && lastNames.length >= 2 && phoneNumber && email && password && userAgreement) {
            if (isAValidPhoneNumber(phoneNumber) && VALIDATE_EMAIL(email) && password.length >= 6)
                setDisabledButton(false)
        }

    }, [names, lastNames, phoneNumber, email, password, userAgreement])

    return (
        <KeyboardAvoidingScrollView contentContainerStyle={{ flex: 1 }}>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <VStack mt={"30px"} h={"100%"} w={"100%"} justifyContent={"space-between"}>
                    <VStack w={"100%"} alignItems={"center"}>
                        <VStack px={"20px"} w={"100%"} alignItems={"flex-start"}>
                            <Heading fontSize={`${TEXT_HEADING_FONT_SIZE - 2}px`} color={"white"}>Crea tu cuenta</Heading>
                            <Text fontSize={`${TEXT_PARAGRAPH_FONT_SIZE}px`} w={"80%"} color={"white"}>
                                Gestiona tu dinero de manera segura, eficiente y sin complicaciones.
                            </Text>
                        </VStack>
                        <VStack w={"100%"} px={"20px"} mt={"30px"} >
                            <Input
                                h={`${INPUT_HEIGHT}px`}
                                style={names.length >= 2 ? styles.InputsSucess : {}}
                                onChangeText={(value) => setNames(value)}
                                value={names}
                                placeholder="Nombres*"
                            />
                            <Input
                                h={`${INPUT_HEIGHT}px`}
                                style={lastNames.length >= 2 ? styles.InputsSucess : {}}
                                value={lastNames}
                                onChangeText={(value) => setLastNames(value)}
                                placeholder="Apellidos*"
                            />
                            <Input
                                h={`${INPUT_HEIGHT}px`}
                                style={isAValidPhoneNumber(phoneNumber) ? styles.InputsSucess : phoneNumber ? styles.InputsFail : {}}
                                maxLength={14}
                                value={phoneNumber.length === 10 ? FORMAT_PHONE_NUMBER(phoneNumber) : phoneNumber}
                                isInvalid={(!isAValidPhoneNumber(phoneNumber) && Boolean(phoneNumber.length === 10))}
                                errorMessage='Este no es un numero no es de República Dominicana'
                                keyboardType="numeric"
                                onChangeText={(value) => setPhoneNumber(value.replaceAll(/[^0-9]/g, ''))}
                                placeholder="Numero De Telefono*"
                            />
                            <Input
                                h={`${INPUT_HEIGHT}px`}
                                isInvalid={showEmailError}
                                errorMessage='Este correo ya pertenece a una cuenta'
                                style={VALIDATE_EMAIL(email) && !showEmailError ? styles.InputsSucess : email ? styles.InputsFail : {}}
                                keyboardType='email-address'
                                value={email}
                                onChangeText={(value) => setEmail(value.toLowerCase().trim())}
                                placeholder="Correo Electrónico*"
                            />
                            <Stack borderRadius={"10px"} my={"5px"} borderWidth={1} borderColor={password.length >= 6 ? colors.mainGreen : password ? colors.alert : "transparent"} w={"100%"}>
                                <Input
                                    m={"0px"}
                                    h={`${INPUT_HEIGHT}px`}
                                    secureTextEntry={!showPassword}
                                    value={password}                                
                                    keyboardType="visible-password"
                                    onChangeText={(value) => setPassword(value)}
                                    placeholder="Contraseña*"
                                    rightElement={
                                        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                            <HStack mr={"15px"}>
                                                <MaterialCommunityIcons name={showPassword ? "eye-outline" : "eye-off-outline"} size={20} color={password.length >= 6 ? colors.mainGreen : password ? colors.alert : "gray"} />
                                            </HStack>
                                        </TouchableOpacity>
                                    }
                                />
                            </Stack>
                        </VStack>

                        <HStack alignSelf={"flex-end"} w={"100%"} mt={"20px"} px={"25px"}>
                            <TouchableOpacity onPress={() => setUserAgreement(!userAgreement)}>
                                <MaterialIcons style={{ marginTop: 3 }} name={userAgreement ? "check-box" : "check-box-outline-blank"} size={28} color={colors.mainGreen} />
                            </TouchableOpacity>
                            <Text mx={"5px"} fontSize={`${TEXT_PARAGRAPH_FONT_SIZE}px`} w={"90%"} color={"white"}>
                                Certifico que tengo más de 18 años de edad y acepto el <Text onPress={() => openTermsAndConditions("userAgreement")} color={"mainGreen"} underline>Acuerdo de Usuario</Text> y la <Text onPress={() => openTermsAndConditions("privacyPolicy")} color={"mainGreen"} underline>Política de Privacidad</Text>.
                            </Text>

                        </HStack>
                    </VStack>
                    <VStack px={"20px"} mt={"20px"} mb={"30px"} w={"100%"} alignItems={"center"}>
                        <Button
                            w={"100%"}
                            disabled={disabledButton}
                            bg={disabledButton ? "lightGray" : "mainGreen"}
                            color={disabledButton ? 'placeholderTextColor' : "white"}
                            mb="10px"
                            onPress={nextPage}
                            title={"Siguiente"}
                        />
                    </VStack>
                </VStack>
            </TouchableWithoutFeedback>
            <BottomSheet onCloseFinish={() => setOpenBottomSheetUrl("")} open={!!openBottomSheetUrl} height={height * 0.9}>
                <WebView
                    style={{ flex: 1 }}
                    source={{ uri: openBottomSheetUrl }}
                />
            </BottomSheet>
        </KeyboardAvoidingScrollView>


    );
}


export default CreateAccount


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