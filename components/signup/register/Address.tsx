import React, { useContext, useEffect, useState } from 'react';
import { VStack, Heading, Text, HStack, TextArea } from 'native-base';
import { StyleSheet, Keyboard, SafeAreaView, TouchableWithoutFeedback, TouchableOpacity } from 'react-native';
import colors from '@/colors';
import { INPUT_HEIGHT, TEXT_HEADING_FONT_SIZE, TEXT_PARAGRAPH_FONT_SIZE, TEXTAREA_HEIGHT } from '@/constants';
import Button from '@/components/global/Button';
import { GlobalContextType } from '@/types';
import { GlobalContext } from '@/contexts/globalContext';
import Input from '@/components/global/Input';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

type Props = {
    nextPage: () => void
    prevPage: () => void
}


const Address: React.FC<Props> = ({ nextPage, prevPage }: Props): JSX.Element => {
    const [disabledButton, setDisabledButton] = useState<boolean>(true);
    const { address, setAddress, addressAgreement, setAddressAgreement } = useContext<GlobalContextType>(GlobalContext);


    useEffect(() => {
        setDisabledButton(true)

        if (address && addressAgreement) {
            setDisabledButton(false)
        }

    }, [address, addressAgreement])


    return (
        <SafeAreaView style={{ backgroundColor: colors.darkGray }}>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss} style={{ flex: 1 }}>
                <VStack mt={"10%"} h={"96%"} w={"100%"} justifyContent={"space-between"}>
                    <VStack>
                        <VStack px={"20px"} w={"100%"} alignItems={"flex-start"}>
                            <Heading fontSize={`${TEXT_HEADING_FONT_SIZE}px`} color={"white"}>Dirección</Heading>
                            <Text fontSize={`${TEXT_PARAGRAPH_FONT_SIZE}px`} w={"80%"} color={"white"}>
                                Ingrese su dirección de residencia para completar el procesamiento de su cuenta.
                            </Text>
                        </VStack>
                        <VStack w={"100%"} px={"20px"} mt={"30px"} alignItems={"center"} >
                            <TextArea
                                borderWidth={0}
                                borderColor={"white"}
                                borderRadius={"10px"}
                                bg={"lightGray"}
                                _focus={{ bg: "lightGray", selectionColor: "white" }}
                                value={address}
                                fontSize={"16px"}
                                onChangeText={(value) => setAddress(value)}
                                h={`${TEXTAREA_HEIGHT}px`}
                                color={"white"}
                                autoCompleteType={"street-address"}
                                placeholder='Ingresa tu dirección'
                                style={addressAgreement ? styles.InputsSucess : address ? styles.InputsFail : {}}
                            />
                        </VStack>
                        <HStack alignSelf={"flex-end"} w={"100%"} mt={"40px"} px={"25px"}>
                            <TouchableOpacity onPress={() => setAddressAgreement(!addressAgreement)}>
                                <MaterialIcons style={{ marginTop: 3 }} name={addressAgreement ? "check-box" : "check-box-outline-blank"} size={28} color={colors.mainGreen} />
                            </TouchableOpacity>
                            <Text mx={"5px"} fontSize={`${TEXT_PARAGRAPH_FONT_SIZE}px`} w={"90%"} color={"white"}>
                                Certifico que la dirección proporcionada es la correcta y corresponde a mi residencia actual.
                            </Text>
                        </HStack>
                    </VStack>
                    <HStack w={"100%"} mb={"40px"} px={"20px"} justifyContent={"space-between"}>
                        <Button
                            w={"49%"}
                            bg={"lightGray"}
                            color={"mainGreen"}
                            mb="10px"
                            onPress={prevPage}
                            title={"Atras"}
                        />
                        <Button
                            w={"49%"}
                            disabled={disabledButton}
                            bg={disabledButton ? "lightGray" : "mainGreen"}
                            color={disabledButton ? 'placeholderTextColor' : "white"}
                            mb="10px"
                            onPress={nextPage}
                            title={"Siguiente"}
                        />
                    </HStack>
                </VStack>
            </TouchableWithoutFeedback>
        </SafeAreaView>
    );
}


export default Address

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