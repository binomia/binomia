import { useContext, useEffect, useState } from 'react';
import { VStack, Heading, HStack, Text } from 'native-base';
import { SafeAreaView, TouchableOpacity, TouchableWithoutFeedback, Keyboard, StyleSheet } from 'react-native';
import { SessionContext } from '@/contexts';
import { SessionPropsType } from '@/types';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Input, Button } from '@/components';
import colors from '@/colors';
import { TEXT_HEADING_FONT_SIZE, TEXT_PARAGRAPH_FONT_SIZE } from '@/constants';
import { VALIDATE_EMAIL } from '@/helpers';

const LoginComponent: React.FC = (): JSX.Element => {
    const { onLogin } = useContext<SessionPropsType>(SessionContext);
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [disabledButton, setDisabledButton] = useState<boolean>(true);



    useEffect(() => {
        setDisabledButton(true)

        if (email && password && VALIDATE_EMAIL(email) && password.length >= 6) {
            if (VALIDATE_EMAIL(email))
                setDisabledButton(false)
        }

    }, [email, password])


    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.darkGray }}>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <VStack w={"100%"} px={"20px"} variant={"body"} mt={"50px"} justifyContent={"space-between"} h={"100%"}>
                    <VStack alignItems={"center"}>
                        <VStack w={"100%"} mb={"50px"}>
                            <Heading fontSize={`${TEXT_HEADING_FONT_SIZE}px`} mb={"5px"} color={"white"}>Iniciar Sesión</Heading>
                            <Text fontSize={`${TEXT_PARAGRAPH_FONT_SIZE}px`} w={"80%"} color={"white"}>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</Text>
                        </VStack>
                        <Input
                            style={VALIDATE_EMAIL(email) ? styles.InputsSucess : email ? styles.InputsFail : {}}
                            onChangeText={(e) => setEmail(e)}
                            placeholder="Correo Electronico*"
                        />
                        <Input
                            secureTextEntry={!showPassword}
                            onChangeText={(e) => setPassword(e)}
                            placeholder="Contraseña*"
                            rightElement={
                                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                    <HStack mr={"15px"}>
                                        <MaterialCommunityIcons name={showPassword ? "eye-outline" : "eye-off-outline"} size={22} color={password.length >= 6 ? colors.mainGreen : password ? colors.alert : "gray"} />
                                    </HStack>
                                </TouchableOpacity>
                            }
                        />
                        <TouchableOpacity style={{ alignSelf: "flex-end" }}>
                            <Text underline alignSelf={"flex-end"} fontWeight={"medium"} mt={"10px"} textAlign={"right"} color={"white"}>Olvidaste tu contraseña?</Text>
                        </TouchableOpacity>
                    </VStack>
                    <VStack w={"100%"} alignItems={"center"} mb={"25px"}>
                        <Button
                            disabled={disabledButton}
                            bg={disabledButton ? "lightGray" : "mainGreen"}
                            color={disabledButton ? 'placeholderTextColor' : "white"}
                            w={"100%"}
                            onPress={() => onLogin({ email, password })}
                            title={"Iniciar Sesión"}
                        />
                    </VStack>
                </VStack>
            </TouchableWithoutFeedback>
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