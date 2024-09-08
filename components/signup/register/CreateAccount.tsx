import { useContext, useEffect, useRef, useState } from 'react';
import { VStack, Heading, Text, HStack } from 'native-base';
import { Keyboard, StyleSheet, TouchableOpacity, TouchableWithoutFeedback } from 'react-native';
import { Button, Input } from '@/components';
import { SessionContext } from '@/contexts';
import { SessionPropsType } from '@/types';
import PagerView from 'react-native-pager-view';
import colors from '@/colors';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { phone } from 'phone';
import { FORMAT_PHONE_NUMBER, VALIDATE_EMAIL } from '@/helpers';
import { KeyboardAvoidingScrollView } from '@cassianosch/react-native-keyboard-sticky-footer-avoiding-scroll-view';
import { INPUT_HEIGHT, TEXT_HEADING_FONT_SIZE, TEXT_PARAGRAPH_FONT_SIZE } from '@/constants';


type Props = {
    nextPage: () => void
}


const CreateAccount: React.FC<Props> = ({ nextPage }: Props): JSX.Element => {
    const [email, setEmail] = useState<string>("");
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

    useEffect(() => {
        setDisabledButton(true)

        if (names.length >= 2 && lastNames.length >= 2 && phoneNumber && email && password && userAgreement) {
            if (isAValidPhoneNumber(phoneNumber) && VALIDATE_EMAIL(email) && password.length >= 6)
                setDisabledButton(false)

        }

    }, [names, lastNames, phoneNumber, email, password, userAgreement])

    return (
        <KeyboardAvoidingScrollView>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss} style={{ paddingBottom: 20 }}>
                <VStack key={"1"} mt={"30px"} bg={"darkGray"} w={"100%"} justifyContent={"space-between"}>
                    <VStack px={"20px"} w={"100%"} alignItems={"flex-start"}>
                        <Heading fontSize={`${TEXT_HEADING_FONT_SIZE}px`} color={"white"}>Crea tu cuenta</Heading>
                        <Text fontSize={`${TEXT_PARAGRAPH_FONT_SIZE}px`} w={"80%"} color={"white"}>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</Text>
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
                            style={VALIDATE_EMAIL(email) ? styles.InputsSucess : email ? styles.InputsFail : {}}
                            keyboardType='email-address'
                            value={email}
                            onChangeText={(value) => setEmail(value)}
                            placeholder="Correo Electrónico*"
                        />
                        <Input
                            h={`${INPUT_HEIGHT}px`}
                            secureTextEntry={!showPassword}
                            value={password}
                            keyboardType="visible-password"
                            onChangeText={(value) => setPassword(value)}
                            placeholder="Contraseña*"
                            rightElement={
                                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                    <HStack mr={"15px"}>
                                        <MaterialCommunityIcons name={showPassword ? "eye-outline" : "eye-off-outline"} size={22} color={password.length >= 6 ? colors.mainGreen : password ? colors.alert : "gray"} />
                                    </HStack>
                                </TouchableOpacity>
                            }
                        />
                    </VStack>
                    <HStack alignSelf={"flex-end"} w={"100%"} mt={"20px"} px={"25px"}>
                        <TouchableOpacity onPress={() => setUserAgreement(!userAgreement)}>
                            <MaterialIcons style={{ marginTop: 3 }} name={userAgreement ? "check-box" : "check-box-outline-blank"} size={28} color={colors.mainGreen} />
                        </TouchableOpacity>
                        <Text mx={"5px"} fontSize={`${TEXT_PARAGRAPH_FONT_SIZE}px`} w={"90%"} color={"white"}>
                            Lorem ipsum dolor amet, consectetur sit on adipiscing elit. Vestibulum User Agreement, molestie Privacy Policy.
                        </Text>
                    </HStack>
                    <VStack px={"20px"} mt={"40px"} alignItems={"center"}>
                        <Button
                            w={"100%"}
                            disabled={disabledButton}
                            bg={disabledButton ? "lightGray" : "mainGreen"}
                            color={disabledButton ? 'placeholderTextColor' : "white"}
                            mb="10px"
                            onPress={() => nextPage()}
                            title={"Siguiente"}
                        />
                    </VStack>
                </VStack>
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