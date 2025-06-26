import { useContext, useEffect, useState } from 'react';
import { VStack, Heading, Text, HStack } from 'native-base';
import { SafeAreaView, TouchableWithoutFeedback, Keyboard, StyleSheet } from 'react-native';
import { SessionContext } from '@/contexts/sessionContext';
import { SessionPropsType } from '@/types';
import colors from '@/colors';
import { INPUT_HEIGHT, TEXT_HEADING_FONT_SIZE, TEXT_PARAGRAPH_FONT_SIZE } from '@/constants';
import { VALIDATE_EMAIL } from '@/helpers';
import AntDesign from '@expo/vector-icons/AntDesign';
import Feather from '@expo/vector-icons/Feather';
import { UserApolloQueries } from '@/apollo/query';
import { useLazyQuery } from '@apollo/client';
import Input from '@/components/global/Input';
import Button from '@/components/global/Button';



type Props = {
    nextPage: () => void
}

const ForgotPassword: React.FC<Props> = ({ nextPage }: Props): JSX.Element => {
    const { sendVerificationCode, setVerificationData } = useContext<SessionPropsType>(SessionContext);
    const [email, setEmail] = useState<string>("");
    const [disabledButton, setDisabledButton] = useState<boolean>(true);
    const [showEmailError, setShowEmailError] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false)
    const [getUserByEmail] = useLazyQuery(UserApolloQueries.userByEmail());

    const sendCode = async () => {
        try {
            setLoading(true)
            const message = await sendVerificationCode(email.toLowerCase())

            if (message)
                setVerificationData({ ...message, email: email.toLowerCase() })


            nextPage()
            setLoading(false)

        } catch (error: any) {
            console.error(error.toString());
            setLoading(false)
        }
    }

    const verifyUserEmail = async (_email: string) => {
        try {
            const user = await getUserByEmail({ variables: { email: email.toLowerCase() } })
            setShowEmailError(!user.data.userByEmail)

        } catch (error) {
            console.error(error);
        }
    }

    useEffect(() => {
        setDisabledButton(true)
        setShowEmailError(false)

        if (VALIDATE_EMAIL(email))
            verifyUserEmail(email)


        if (email && VALIDATE_EMAIL(email))
            setDisabledButton(false)


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
                        value={email.toLowerCase()}
                            keyboardType="email-address"
                            h={`${INPUT_HEIGHT}px`}
                            style={VALIDATE_EMAIL(email) ? styles.InputsSucess : email ? styles.InputsFail : {}}
                            onChangeText={(e) => setEmail(e)}
                            placeholder={"Correo Electronico*"}
                        />

                        {showEmailError ?
                            <HStack space={2} w={"100%"} mt={"20px"}>
                                <Feather style={{ marginTop: 5 }} name="alert-circle" size={24} color={colors.alert} />
                                <Text fontSize={`${TEXT_PARAGRAPH_FONT_SIZE}px`} w={"85%"} color={"alert"}>
                                    El correo electronico <Text color={"white"}>{email.toLowerCase()}</Text> no se encuentra registrado como usuario.
                                    Por favor verifique e intente de nuevo.
                                </Text>
                            </HStack>
                            : VALIDATE_EMAIL(email) ?
                                <HStack space={2} mt={"20px"}>
                                    <AntDesign style={{ marginTop: 5 }} name="checkcircle" size={24} color={colors.mainGreen} />
                                    <Text fontSize={`${TEXT_PARAGRAPH_FONT_SIZE}px`} w={"85%"} color={"mainGreen"}>
                                        Te enviaremos un código de verificación de 6 digitos a <Text color={"white"}>{email.toLowerCase()}</Text> para recuperar tu cuenta.
                                    </Text>
                                </HStack>
                                : null
                        }
                    </VStack>
                    <VStack w={"100%"} alignItems={"center"} mb={"40px"}>
                        <Button
                            spin={loading}
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