import { useContext, useEffect, useState } from 'react';
import { VStack, Heading, Text, HStack } from 'native-base';
import { SafeAreaView, TouchableWithoutFeedback, Keyboard, StyleSheet, Platform } from 'react-native';
import { SessionContext } from '@/contexts';
import { SessionPropsType } from '@/types';
import { Button } from '@/components';
import colors from '@/colors';
import { INPUT_CODE_HEIGHT, INPUT_HEIGHT, TEXT_HEADING_FONT_SIZE, TEXT_PARAGRAPH_FONT_SIZE } from '@/constants';
import { GENERATE_SIX_DIGIT_TOKEN, VALIDATE_EMAIL } from '@/helpers';
import { CodeField, Cursor, useBlurOnFulfill, useClearByFocusCell, } from 'react-native-confirmation-code-field';
import digitToken from 'n-digit-token';
import Feather from '@expo/vector-icons/Feather';
import AntDesign from '@expo/vector-icons/AntDesign';

type Props = {
    nextPage: () => void
}

const CELL_COUNT = 6;
const VerifyCode: React.FC<Props> = ({ nextPage }: Props): JSX.Element => {
    const { onLogin } = useContext<SessionPropsType>(SessionContext);
    const [disabledButton, setDisabledButton] = useState<boolean>(false);
    const [invalidCode, setInvalidCode] = useState<boolean>(false);

    const [token, setToken] = useState('101394');
    const [code, setCode] = useState('');
    const ref = useBlurOnFulfill({ value: code, cellCount: 6 });
    const [props, getCellOnLayoutHandler] = useClearByFocusCell({
        value: code,
        setValue: setCode,
    });


    useEffect(() => {
        setDisabledButton(true)
        setInvalidCode(false)

        if (code.length === 6 && code !== token)
            setInvalidCode(true)


        if (code.length === 6 && code === token)
            setDisabledButton(false)


    }, [code])


    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.darkGray }}>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <VStack borderRadius={"10px"} w={"100%"} px={"20px"} variant={"body"} mt={"30px"} justifyContent={"space-between"} h={"100%"}>
                    <VStack alignItems={"center"}>
                        <VStack w={"100%"} mb={"50px"}>
                            <Heading fontSize={`${TEXT_HEADING_FONT_SIZE - 10}px`} mb={"5px"} color={"white"}>Verificar Código</Heading>
                            <Text fontSize={`${TEXT_PARAGRAPH_FONT_SIZE}px`} w={"85%"} color={"white"}>Ingrese el código de verificación de 6 digitos enviado a su correo electronico.</Text>
                        </VStack>
                        <CodeField
                            ref={ref}
                            {...props}
                            value={code}
                            onChangeText={setCode}
                            cellCount={CELL_COUNT}
                            rootStyle={styles.codeFieldRoot}
                            keyboardType="number-pad"
                            textContentType="oneTimeCode"
                            renderCell={({ index, symbol, isFocused }) => (
                                <HStack justifyContent={"center"} alignItems={"center"} style={[styles.cell, isFocused && styles.focusCell]}>
                                    <Text
                                        color={colors.white}
                                        fontSize={"28px"}
                                        key={index}
                                        onLayout={getCellOnLayoutHandler(index)}>
                                        {symbol || (isFocused ? <Cursor /> : null)}
                                    </Text>
                                </HStack>
                            )}
                        />
                        {invalidCode ?
                            <HStack mt={"20px"}>
                                <Feather style={{ marginTop: 5 }} name="alert-circle" size={24} color={colors.alert} />
                                <Text textAlign={"center"} fontSize={`${TEXT_PARAGRAPH_FONT_SIZE}px`} w={"85%"} color={"alert"}>
                                    Por favor, ingrese un código valido. Se envió un código de verificación de 6 digitos enviado a su correo electronico.
                                </Text>
                            </HStack>
                            :
                            code.length === 6 && code === token &&
                            <HStack mt={"20px"}>
                                <AntDesign style={{ marginTop: 5 }} name="checkcircle" size={24} color={colors.mainGreen} />
                                <Text textAlign={"center"} fontSize={`${TEXT_PARAGRAPH_FONT_SIZE}px`} w={"85%"} color={"mainGreen"}>
                                    As ingresado un código valido. Ahora puede presionar el botón Siguiente para continuar.
                                </Text>
                            </HStack>
                        }

                    </VStack>
                    <VStack w={"100%"} alignItems={"center"} mb={"100px"}>
                        <Button
                            disabled={disabledButton}
                            bg={disabledButton ? "lightGray" : "mainGreen"}
                            color={disabledButton ? 'placeholderTextColor' : "white"}
                            w={"100%"}
                            onPress={nextPage}
                            title={"Siguiente"}
                        />
                    </VStack>
                </VStack>
            </TouchableWithoutFeedback>
        </SafeAreaView >

    );
}


export default VerifyCode


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
    },
    codeFieldRoot: { marginTop: 10, borderRadius: 10 },
    cell: {
        width: INPUT_CODE_HEIGHT,
        height: INPUT_CODE_HEIGHT,
        margin: 5,
        borderRadius: 10,
        backgroundColor: colors.lightGray,
        textAlign: 'center',
        borderWidth: 1,
        borderColor: colors.lightGray,
        textAlignVertical: 'center',
    },
    focusCell: {
        borderColor: colors.mainGreen,
    },
});