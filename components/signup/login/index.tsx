import { useContext, useEffect, useRef, useState } from 'react';
import { VStack, Heading, HStack, Text } from 'native-base';
import { SafeAreaView, TouchableOpacity, TouchableWithoutFeedback, Keyboard, StyleSheet } from 'react-native';
import { SessionContext } from '@/contexts';
import { SessionPropsType } from '@/types';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Input, Button, BottomSheet, ForgotPassword, VerifyCode } from '@/components';
import colors from '@/colors';
import { INPUT_HEIGHT, SCREEN_HEIGHT, TEXT_HEADING_FONT_SIZE, TEXT_PARAGRAPH_FONT_SIZE } from '@/constants';
import { VALIDATE_EMAIL } from '@/helpers';
import PagerView from 'react-native-pager-view';

const LoginComponent: React.FC = (): JSX.Element => {
    const pageViewRef = useRef<PagerView>(null);
    const { onLogin } = useContext<SessionPropsType>(SessionContext);
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");

    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [disabledButton, setDisabledButton] = useState<boolean>(true);
    const [currentPage, setCurrentPage] = useState<number>(1);


    const nextPage = () => {
        if (currentPage === 2) {
            pageViewRef.current?.setPage(0)
            setCurrentPage(0)

        } else
            pageViewRef.current?.setPage(currentPage + 1)
        setCurrentPage(currentPage + 1)
    }



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
                <VStack w={"100%"} px={"20px"} variant={"body"} mt={"30px"} justifyContent={"space-between"} h={"100%"}>
                    <VStack alignItems={"center"}>
                        <VStack w={"100%"} mb={"50px"}>
                            <Heading fontSize={`${TEXT_HEADING_FONT_SIZE}px`} mb={"5px"} color={"white"}>Iniciar Sesión</Heading>
                            <Text fontSize={`${TEXT_PARAGRAPH_FONT_SIZE}px`} w={"80%"} color={"white"}>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</Text>
                        </VStack>
                        <Input
                            h={`${INPUT_HEIGHT}px`}
                            style={VALIDATE_EMAIL(email) ? styles.InputsSucess : email ? styles.InputsFail : {}}
                            onChangeText={(e) => setEmail(e)}
                            placeholder="Correo Electronico*"
                        />
                        <Input
                            h={`${INPUT_HEIGHT}px`}
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
                            <Text underline fontSize={`${TEXT_PARAGRAPH_FONT_SIZE}px`} alignSelf={"flex-end"} fontWeight={"medium"} mt={"10px"} textAlign={"right"} color={"white"}>Olvidaste tu contraseña?</Text>
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
                    <BottomSheet sheetBg='white' height={SCREEN_HEIGHT * 0.8} open>
                        <PagerView ref={pageViewRef} style={{ flex: 1 }} initialPage={currentPage}>
                            <ForgotPassword nextPage={nextPage} key="1" />
                            <VerifyCode nextPage={nextPage} key="1" />
                        </PagerView>
                    </BottomSheet>
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