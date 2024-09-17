import { useContext, useEffect, useRef, useState } from 'react';
import { VStack, Heading, Text, HStack, Image } from 'native-base';
import { StyleSheet, Keyboard, SafeAreaView, TouchableWithoutFeedback, Dimensions } from 'react-native';
import colors from '@/colors';
import { INPUT_HEIGHT, TEXT_HEADING_FONT_SIZE, TEXT_PARAGRAPH_FONT_SIZE } from '@/constants';
import Button from '@/components/global/Button';
import { GlobalContextType } from '@/types';
import { GlobalContext } from '@/contexts/globalContext';
import Input from '@/components/global/Input';
import { idMock } from '@/assets';
import BottomSheet from '@/components/global/BottomSheet';
import { FORMAT_CEDULA } from '@/helpers';
import axios from 'axios';
import Feather from '@expo/vector-icons/Feather';
import ScanDocument from '@/components/ScanDocument';
import DocumentScanner from 'react-native-document-scanner-plugin';


type Props = {
    nextPage: () => void
    prevPage: () => void
}

const { width, height } = Dimensions.get("window");

const AddCedula: React.FC<Props> = ({ nextPage, prevPage }: Props): JSX.Element => {
    const { address, setAddress, } = useContext<GlobalContextType>(GlobalContext);
    const [disabledButton, setDisabledButton] = useState<boolean>(true);
    const [id, setID] = useState<string>("");
    const [isInvalid, setIsInvalid] = useState<boolean>(false)


    const goNextPage = () => {
        console.log({ id });

        nextPage()
    }

    const validateCedula = async () => {
        try {
            await axios.get(`https://api.digital.gob.do/v3/cedulas/${id.replace(/-/g, '')}/validate`).then((response) => {
                setIsInvalid(false)
            })

        } catch (error) {
            console.log({ error });
            setIsInvalid(true)
        }
    }


    useEffect(() => {
        setDisabledButton(true)

        if (id.length === 13) {
            setIsInvalid(false)
            validateCedula()
            setDisabledButton(false)
            // setAddress({
            //     id
            // })
        }

    }, [id])


    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} style={{ flex: 1 }}>
            <VStack h={"100%"} w={"100%"} justifyContent={"space-between"}>
                <VStack pt={"10%"} bg={"red.200"}>
                    <VStack px={"20px"} w={"100%"} alignItems={"flex-start"}>
                        <Heading fontSize={`${TEXT_HEADING_FONT_SIZE - 5}px`} color={"white"}>Datos De La Cédula</Heading>
                        <Text fontSize={`${TEXT_PARAGRAPH_FONT_SIZE}px`} w={"85%"} color={"white"}>
                            Por favor, proporcione los datos de su cedula. Esto nos permitirá fortalecer la seguridad de su cuenta.
                        </Text>
                    </VStack>
                    <VStack w={width} h={"50%"} px={"30px"} mt={"30px"} alignItems={"center"} >
                        <Input                            
                            h={`${INPUT_HEIGHT}px`}
                            maxLength={12}
                            style={id.length === 13 && !isInvalid ? styles.InputsSucess : id && isInvalid ? styles.InputsFail : {}}
                            onChangeText={(value) => setID(FORMAT_CEDULA(value.replace(/-/g, '')))}
                            keyboardType="number-pad"
                            value={id}
                            placeholder="Nombre En La Cédula*"
                        />
                        <Input
                            isInvalid={isInvalid}
                            errorMessage='El correo electronico no se encuentra registrado como usuario.
                            Por favor verifique e intente de nuevo.'
                            h={`${INPUT_HEIGHT}px`}
                            maxLength={12}
                            style={id.length === 13 && !isInvalid ? styles.InputsSucess : id && isInvalid ? styles.InputsFail : {}}
                            onChangeText={(value) => setID(FORMAT_CEDULA(value.replace(/-/g, '')))}
                            keyboardType="number-pad"
                            value={id}
                            placeholder="Numero De Cédula*"
                        />
                    </VStack>
                </VStack>
                <HStack position={"absolute"} bottom={"30px"} w={"100%"} px={"20px"} justifyContent={"space-between"}>
                    <Button
                        w={"49%"}
                        bg={"lightGray"}
                        color={"mainGreen"}
                        onPress={prevPage}
                        title={"Atras"}
                    />
                    <Button
                        w={"49%"}
                        disabled={disabledButton}
                        bg={disabledButton ? "lightGray" : "mainGreen"}
                        color={disabledButton ? 'placeholderTextColor' : "white"}
                        onPress={goNextPage}
                        title={"Siguiente"}
                    />
                </HStack>
            </VStack>
        </TouchableWithoutFeedback>
    );
}


export default AddCedula

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