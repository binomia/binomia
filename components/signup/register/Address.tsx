import { useState } from 'react';
import { VStack, Heading, Text, HStack, TextArea } from 'native-base';
import { Keyboard, SafeAreaView, TouchableWithoutFeedback } from 'react-native';
import colors from '@/colors';
import { TEXT_HEADING_FONT_SIZE, TEXT_PARAGRAPH_FONT_SIZE } from '@/constants';
import Button from '@/components/global/Button';


const Address: React.FC = (): JSX.Element => {
    const [address, setAddress] = useState<string>("");
    const [disabledButton, setDisabledButton] = useState<boolean>(true);



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
                                value={address}
                                onChangeText={(value) => setAddress(value)}
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