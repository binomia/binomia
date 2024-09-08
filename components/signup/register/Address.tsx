import { useEffect, useState } from 'react';
import { VStack, Heading, Text, HStack, TextArea } from 'native-base';
import { Keyboard, SafeAreaView, StyleSheet, Dimensions, TouchableWithoutFeedback, TextInput } from 'react-native';
import { Button, Input } from '@/components';

import colors from '@/colors';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { phone } from 'phone';
import { VALIDATE_EMAIL } from '@/helpers';
import { KeyboardAvoidingScrollView } from '@cassianosch/react-native-keyboard-sticky-footer-avoiding-scroll-view';
import { SCREEN_HEIGHT, SCREEN_WIDTH, TEXT_HEADING_FONT_SIZE, TEXT_PARAGRAPH_FONT_SIZE} from '@/constants';
import { RFPercentage, RFValue } from "react-native-responsive-fontsize";




const { width, height } = Dimensions.get("window");
const Address: React.FC = (): JSX.Element => {
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
        console.log({ SCREEN_HEIGHT, SCREEN_WIDTH, TEXT_HEADING_FONT_SIZE });

        setDisabledButton(true)

        if (names.length >= 2 && lastNames.length >= 2 && phoneNumber && email && password && userAgreement) {
            if (isAValidPhoneNumber(phoneNumber) && VALIDATE_EMAIL(email) && password.length >= 6)
                setDisabledButton(false)

        }

    }, [names, lastNames, phoneNumber, email, password, userAgreement])

    return (
        <SafeAreaView style={{ backgroundColor: colors.darkGray }}>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <VStack mt={"10%"} h={"95%"} w={"100%"} justifyContent={"space-between"}>
                    <VStack>
                        <VStack px={"20px"} w={"100%"} alignItems={"flex-start"}>
                            <Heading fontSize={`${TEXT_HEADING_FONT_SIZE}px`} color={"white"}>Crea tu cuenta</Heading>
                            <Text fontSize={`${TEXT_PARAGRAPH_FONT_SIZE}px`} w={"80%"} color={"white"}>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</Text>
                        </VStack>
                        <VStack w={"100%"} px={"20px"} mt={"30px"} alignItems={"center"} >
                            <TextArea
                                variant={"input"}
                                fontSize={"16px"}
                                _focus={{ selectionColor: "white" }}
                                h={"120px"}
                                placeholder="Dirección*"
                                w="100%"
                                color={colors.white}
                                autoCompleteType={undefined}
                                placeholderTextColor={"rgba(255,255,255,0.2)"}
                            />
                        </VStack>
                    </VStack>
                    <HStack w={"100%"} mb={"40px"} px={"20px"} justifyContent={"space-between"}>
                        <Button
                            w={"49%"}
                            bg={"lightGray"}
                            color={"mainGreen"}
                            mb="10px"
                            onPress={() => { }}
                            title={"Atras"}
                        />
                        <Button
                            w={"49%"}
                            disabled={disabledButton}
                            bg={disabledButton ? "lightGray" : "mainGreen"}
                            color={disabledButton ? 'placeholderTextColor' : "white"}
                            mb="10px"
                            onPress={() => { }}
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
    TextInputs: {
        height: 100,
        alignItems: "flex-end",
        borderWidth: 2,
        borderColor: colors.lightGray,
        borderRadius: 10,
        padding: 10,
        marginBottom: 10

    },
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
    welcome: {
        fontSize: RFValue(24, 580),
    },
    instructions: {
        textAlign: "center",
        color: "#333333",
        marginBottom: 5,
        fontSize: RFPercentage(5),
    },
});