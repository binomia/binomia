import colors from '@/colors';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Input from '@/components/global/Input';
import Button from '@/components/global/Button';
import { useContext, useEffect, useState } from 'react';
import { VStack, Heading, Text, HStack, Box } from 'native-base';
import { Keyboard, StyleSheet, TouchableOpacity, TouchableWithoutFeedback, Dimensions, View } from 'react-native';
import { phone } from 'phone';
import { FORMAT_PHONE_NUMBER, VALIDATE_EMAIL } from '@/helpers';
import { KeyboardAvoidingScrollView } from '@cassianosch/react-native-keyboard-sticky-footer-avoiding-scroll-view';
import { INPUT_HEIGHT, TEXT_HEADING_FONT_SIZE, TEXT_PARAGRAPH_FONT_SIZE } from '@/constants';
import { GlobalContext } from '@/contexts/globalContext';
import { GlobalContextType } from '@/types';
import { useDispatch } from 'react-redux';
import { registerActions } from '@/redux/slices/registerSlice';



type Props = {
    nextPage: () => void
}


const { width, height } = Dimensions.get("window");
const CreateAccount: React.FC<Props> = ({ nextPage }: Props): JSX.Element => {
    const dispatch = useDispatch()
    const { } = useContext<GlobalContextType>(GlobalContext);

    const [showEmailError, setShowEmailError] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false)

    const [email, setEmailAddress] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [names, setNames] = useState<string>("");
    const [lastNames, setLastNames] = useState<string>("");
    const [phoneNumber, setPhoneNumber] = useState<string>("");
    const [userAgreement, setUserAgreement] = useState<boolean>(false);
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [disabledButton, setDisabledButton] = useState<boolean>(true);


    const isAValidPhoneNumber = (value: string) => {
        const { isValid } = phone(value, { country: "DO" });
        return isValid
    };

    const checkIfEmailExists = async () => {
        setShowEmailError(false)
        if (VALIDATE_EMAIL(email)) {
            try {


            } catch (error: any) {
                console.error(error);            
                setShowEmailError(false)
            }

        } else {
            setShowEmailError(false)
        }
    }

    const onChangeText = (value: string, type: string) => {
        switch (type) {
            case "names":
                setNames(value)
                dispatch(registerActions.setFullName(`${value.trim()} ${lastNames.trim()}`))
                break;
            case "lastNames":
                setLastNames(value)
                dispatch(registerActions.setFullName(`${names.trim()} ${value.trim()}`))
                break;
            case "phone":
                setPhoneNumber(value)
                dispatch(registerActions.setPhone(value))
                break;
            case "email":
                setEmailAddress(value)
                dispatch(registerActions.setEmail(value))
                break;
            case "password":
                setPassword(value)
                dispatch(registerActions.setPassword(value))
                break;

            default:
                break;
        }
    }

    useEffect(() => {
        checkIfEmailExists()

    }, [email])


    useEffect(() => {
        setDisabledButton(true)

        if (names.length >= 2 && lastNames.length >= 2 && phoneNumber && email && password && userAgreement) {
            if (isAValidPhoneNumber(phoneNumber) && VALIDATE_EMAIL(email) && password.length >= 6 && !showEmailError)
                setDisabledButton(false)
        }

    }, [names, lastNames, phoneNumber, email, password, userAgreement, showEmailError])


    return (
        <KeyboardAvoidingScrollView >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={{ width, height: height - 130, display: "flex", justifyContent: "space-between" }} >
                    <VStack mt={"30px"} w={"100%"} alignItems={"center"}>
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
                                onChangeText={(value) => onChangeText(value, "names")}
                                value={names}
                                placeholder="Nombres*"
                            />
                            <Input
                                h={`${INPUT_HEIGHT}px`}
                                style={lastNames.length >= 2 ? styles.InputsSucess : {}}
                                value={lastNames}
                                onChangeText={(value) => onChangeText(value, "lastNames")}
                                placeholder="Apellidos*"
                            />
                            <Input
                                h={`${INPUT_HEIGHT}px`}
                                style={isAValidPhoneNumber(phoneNumber) ? styles.InputsSucess : phoneNumber ? styles.InputsFail : {}}
                                maxLength={14}
                                value={phoneNumber.length === 10 ? FORMAT_PHONE_NUMBER(phoneNumber) : phoneNumber}
                                isInvalid={(!isAValidPhoneNumber(phoneNumber) && Boolean(phoneNumber.length === 10))}
                                errorMessage='Este no es un numero no es de República Dominicana'
                                keyboardType="phone-pad"
                                onChangeText={(value) => onChangeText(value.replaceAll(/[^0-9]/g, ''), "phone")}
                                placeholder="Numero De Telefono*"
                            />
                            <Input
                                h={`${INPUT_HEIGHT}px`}
                                isInvalid={showEmailError}
                                errorMessage='Este correo ya pertenece a una cuenta'
                                style={VALIDATE_EMAIL(email) && !showEmailError ? styles.InputsSucess : email ? styles.InputsFail : {}}
                                keyboardType='email-address'
                                value={email}
                                onChangeText={(value) => onChangeText(value.toLowerCase().trim(), "email")}
                                placeholder="Correo Electrónico*"
                            />
                            <Box borderRadius={"10px"} my={"5px"} borderWidth={1} borderColor={password.length >= 6 ? colors.mainGreen : password ? colors.alert : "transparent"} w={"100%"}>
                                <Input
                                    m={"0px"}
                                    h={`${INPUT_HEIGHT}px`}
                                    secureTextEntry={!showPassword}
                                    value={password}
                                    keyboardType="visible-password"
                                    onChangeText={(value) => onChangeText(value, "password")}
                                    placeholder="Contraseña*"
                                    rightElement={
                                        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                            <HStack mr={"15px"}>
                                                <MaterialCommunityIcons name={showPassword ? "eye-outline" : "eye-off-outline"} size={20} color={password.length >= 6 ? colors.mainGreen : password ? colors.alert : "gray"} />
                                            </HStack>
                                        </TouchableOpacity>
                                    }
                                />
                            </Box>
                        </VStack>

                        <HStack alignSelf={"flex-end"} w={"100%"} mt={"20px"} px={"25px"}>
                            <TouchableOpacity onPress={() => {
                                dispatch(registerActions.setUserAgreement(!userAgreement))
                                setUserAgreement(!userAgreement)
                            }}>
                                <MaterialIcons style={{ marginTop: 3 }} name={userAgreement ? "check-box" : "check-box-outline-blank"} size={28} color={colors.mainGreen} />
                            </TouchableOpacity>
                            <Text mx={"5px"} fontSize={`${TEXT_PARAGRAPH_FONT_SIZE}px`} w={"90%"} color={"white"}>
                                Certifico que tengo más de 18 años de edad y acepto el <Text onPress={() => { }} color={"mainGreen"} underline>Acuerdo de Usuario</Text> y la <Text onPress={() => { }} color={"mainGreen"} underline>Política de Privacidad</Text>.
                            </Text>

                        </HStack>
                    </VStack>
                    <VStack bg={"red.100"} px={"20px"} w={"100%"}>
                        <Button
                            spin={loading}
                            w={"100%"}
                            // disabled={disabledButton}
                            bg={disabledButton ? "lightGray" : "mainGreen"}
                            color={disabledButton ? 'placeholderTextColor' : "white"}
                            mb="10px"
                            onPress={async () => {
                                setLoading(true)
                                nextPage()
                                setLoading(false)
                            }}
                            title={"Siguiente"}
                        />
                    </VStack>
                </View>
            </TouchableWithoutFeedback>
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