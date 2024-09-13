import React, { useContext, useEffect, useState } from 'react';
import { VStack, Heading, Text, HStack } from 'native-base';
import { StyleSheet, Keyboard, SafeAreaView, TouchableWithoutFeedback } from 'react-native';
import colors from '@/colors';
import { INPUT_HEIGHT, TEXT_HEADING_FONT_SIZE, TEXT_PARAGRAPH_FONT_SIZE } from '@/constants';
import Button from '@/components/global/Button';
import { GlobalContextType } from '@/types';
import { GlobalContext } from '@/contexts/globalContext';
import Input from '@/components/global/Input';


type Props = {
    nextPage: () => void
    prevPage: () => void
}


const Address: React.FC<Props> = ({ nextPage, prevPage }: Props): JSX.Element => {
    const [disabledButton, setDisabledButton] = useState<boolean>(true);
    const { address, setAddress, } = useContext<GlobalContextType>(GlobalContext);
    const [street, setStreet] = useState<string>("");
    const [number, setNumber] = useState<string>("");
    const [province, setProvince] = useState<string>("");
    const [sector, setSector] = useState<string>("");
    const [municipality, setMunicipality] = useState<string>("");




    useEffect(() => {
        setDisabledButton(true)
        console.log({ address, street, number, province, sector, municipality });

        if (street.length >= 2 && number && province.length >= 2 && sector.length >= 2 && municipality.length >= 2) {
            setDisabledButton(false)
            setAddress({
                street,
                number: Number(number),
                province,
                city: sector,
                municipality
            })
        }

    }, [street, number, province, sector, municipality])


    return (
        <SafeAreaView style={{ backgroundColor: colors.darkGray }}>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss} style={{ flex: 1 }}>
                <VStack mt={"10%"} h={"96%"} w={"100%"} justifyContent={"space-between"}>
                    <VStack>
                        <VStack px={"20px"} w={"100%"} alignItems={"flex-start"}>
                            <Heading fontSize={`${TEXT_HEADING_FONT_SIZE}px`} color={"white"}>Dirección</Heading>
                            <Text fontSize={`${TEXT_PARAGRAPH_FONT_SIZE}px`} w={"80%"} color={"white"}>
                                Ingrese su dirección donde reside. Lo cual nos a procesar tu cuenta.
                            </Text>
                        </VStack>
                        <VStack w={"100%"} px={"20px"} mt={"30px"} alignItems={"center"} >
                            <Input
                                h={`${INPUT_HEIGHT}px`}
                                style={street.length >= 2 ? styles.InputsSucess : {}}
                                onChangeText={(value) => setStreet(value)}
                                value={street}
                                placeholder="Nombres De La Calle*"
                            />
                            <Input
                                h={`${INPUT_HEIGHT}px`}
                                keyboardType="number-pad"
                                style={number.length >= 2 ? styles.InputsSucess : {}}
                                onChangeText={(value) => setNumber(value)}
                                value={number}
                                placeholder="Numero De Casa*"
                            />
                            <Input
                                h={`${INPUT_HEIGHT}px`}
                                style={sector.length >= 2 ? styles.InputsSucess : {}}
                                onChangeText={(value) => setSector(value)}
                                value={sector}
                                placeholder="Sector*"
                            />
                            <Input
                                h={`${INPUT_HEIGHT}px`}
                                style={municipality.length >= 2 ? styles.InputsSucess : {}}
                                onChangeText={(value) => setMunicipality(value)}
                                value={municipality}
                                placeholder="Municipio*"
                            />
                            <Input
                                h={`${INPUT_HEIGHT}px`}
                                style={province.length >= 2 ? styles.InputsSucess : {}}
                                onChangeText={(value) => setProvince(value)}
                                value={province}
                                placeholder="Provincia*"
                            />
                        </VStack>
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