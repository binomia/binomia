import { useContext, useEffect, useState } from 'react';
import { VStack, Heading, Text } from 'native-base';
import { SafeAreaView, TouchableWithoutFeedback, Keyboard, StyleSheet } from 'react-native';
import { SessionContext } from '@/contexts';
import { SessionPropsType } from '@/types';
import { Input, Button } from '@/components';
import colors from '@/colors';
import { INPUT_HEIGHT, TEXT_HEADING_FONT_SIZE, TEXT_PARAGRAPH_FONT_SIZE } from '@/constants';
import { VALIDATE_EMAIL } from '@/helpers';

type Props = {
    nextPage: () => void
}

const ForgotPassword: React.FC<Props> = ({ nextPage }: Props): JSX.Element => {
    const { sendVerificationCode } = useContext<SessionPropsType>(SessionContext);
    const [email, setEmail] = useState<string>("");
    const [disabledButton, setDisabledButton] = useState<boolean>(true);


    const sendCode = async () => {
        try {
            const message = await sendVerificationCode(email.toLowerCase())

            if (message) {
                nextPage()
            }

        } catch (error: any) {
            console.error(error.toString());
        }
    }

    useEffect(() => {
        setDisabledButton(true)

        if (email && VALIDATE_EMAIL(email)) {
            setDisabledButton(false)
        }

    }, [email])


    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.darkGray }}>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <VStack borderRadius={"10px"} w={"100%"} px={"20px"} variant={"body"} mt={"30px"} justifyContent={"space-between"} h={"100%"}>
                    <VStack alignItems={"center"}>
                        <VStack w={"100%"} mb={"50px"}>
                            <Heading fontSize={`${TEXT_HEADING_FONT_SIZE - 10}px`} mb={"5px"} color={"white"}>Recuperar Contraseña</Heading>
                            <Text fontSize={`${TEXT_PARAGRAPH_FONT_SIZE}px`} w={"85%"} color={"white"}>Ingrese su correo electrónico para enviarle un código de recuperación de contraseña.</Text>
                        </VStack>
                        <Input
                            keyboardType="email-address"
                            h={`${INPUT_HEIGHT}px`}
                            style={VALIDATE_EMAIL(email) ? styles.InputsSucess : email ? styles.InputsFail : {}}
                            onChangeText={(e) => setEmail(e)}
                            placeholder={"Correo Electronico*"}
                        />
                    </VStack>
                    <VStack w={"100%"} alignItems={"center"} mb={"30px"}>
                        <Button

                            disabled={disabledButton}
                            bg={disabledButton ? "lightGray" : "mainGreen"}
                            color={disabledButton ? 'placeholderTextColor' : "white"}
                            w={"100%"}
                            onPress={sendCode}
                            title={"Siguiente"}
                        />
                    </VStack>
                </VStack>
            </TouchableWithoutFeedback>
        </SafeAreaView>

    );
}


export default ForgotPassword


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