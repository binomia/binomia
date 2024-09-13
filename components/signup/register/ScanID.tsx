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
import { useDocumentScanner } from '@/hooks/useDocumentScan';

type Props = {
    nextPage: () => void
    prevPage: () => void
}

const { width, height } = Dimensions.get("window");

const ScanID: React.FC<Props> = ({ nextPage, prevPage }: Props): JSX.Element => {
    const { address, setAddress, } = useContext<GlobalContextType>(GlobalContext);
    const [disabledButton, setDisabledButton] = useState<boolean>(true);
    const [street, setStreet] = useState<string>("");
    const [number, setNumber] = useState<string>("");
    const [province, setProvince] = useState<string>("");
    const [city, setCity] = useState<string>("");
    const [municipality, setMunicipality] = useState<string>("");

    const [openBottomSheet, setOpenBottomSheet] = useState<boolean>(false);
    const { scanDocument, document } = useDocumentScanner()


    const handleScanDocument = () => {
        console.log({ document });
        
        // setOpenBottomSheet(true)
        scanDocument()
    }


    useEffect(() => {
        console.log({ document });

    }, [document])


    useEffect(() => {
        setDisabledButton(true)

        if (street.length >= 2 && number && province.length >= 2 && city.length >= 2 && municipality.length >= 2) {
            setDisabledButton(false)
            setAddress({
                street,
                number: Number(number),
                province,
                city,
                municipality
            })
        }

        console.log({ address, street, number, province, city, municipality });

    }, [address, street, number, province, city, municipality])


    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <VStack  h={"100%"} w={"100%"} justifyContent={"space-between"}>
                <VStack pt={"10%"}>
                    <VStack px={"20px"} w={"100%"} alignItems={"flex-start"}>
                        <Heading fontSize={`${TEXT_HEADING_FONT_SIZE - 2}px`} color={"white"}>Ingresa Tu Dirección</Heading>
                        <Text fontSize={`${TEXT_PARAGRAPH_FONT_SIZE}px`} w={"80%"} color={"white"}>
                            Por favor, proporcione su dirección de residencia. Esto nos permitirá fortalecer la seguridad de su cuenta.
                        </Text>
                    </VStack>
                    <VStack w={width} h={"50%"} px={"30px"} mt={"30px"} alignItems={"center"} >
                        <Image width={"100%"} height={"100%"} resizeMode='contain' source={idMock} />
                    </VStack>
                </VStack>
                <HStack px={"20px"} justifyContent={"space-between"}>
                    <Button
                        w={"49%"}
                        bg={"lightGray"}
                        color={"mainGreen"}
                        onPress={prevPage}
                        title={"Atras"}
                    />
                    <Button
                        w={"49%"}
                        bg={"mainGreen"}
                        color={"white"}
                        onPress={handleScanDocument}
                        title={"Escanear"}
                    />
                </HStack>
            </VStack>
        </TouchableWithoutFeedback>
    );
}


export default ScanID

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