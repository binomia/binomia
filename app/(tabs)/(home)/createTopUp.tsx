import React, { useState } from 'react'
import { Dimensions, Keyboard, StyleSheet, TouchableWithoutFeedback } from 'react-native'
import { Heading, Image, Text, VStack, HStack, Pressable } from 'native-base'
import colors from '@/colors'
import BottomSheet from '@/components/global/BottomSheet'
import { topUpCompanies } from '@/mocks'
import Input from '@/components/global/Input'
import { Entypo } from "@expo/vector-icons";
import Button from '@/components/global/Button'
import { FORMAT_PHONE_NUMBER } from '@/helpers'
import phone from 'phone'


const { height } = Dimensions.get('window')
const CreateTopUp: React.FC = () => {
    const [selectedCompany, setSelectedCompany] = useState<any>({});
    const [openBottomSheet, setOpenBottomSheet] = useState(false);
    const [phoneNumber, setPhoneNumber] = useState<string>("");


    const onCloseFinish = () => {
        setOpenBottomSheet(false)
    }

    const onCompanySelect = (company: any) => {
        setSelectedCompany(company)
        setOpenBottomSheet(false)
    }

    const onChangeText = (value: string) => {
        setPhoneNumber(value)
    }

    const isAValidPhoneNumber = (value: string) => {
        const { isValid } = phone(value, { country: "DO" });
        return isValid
    };

    return (
        <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
            <VStack variant={"body"} justifyContent={"space-between"} h={"100%"}>
                <VStack>
                    <Pressable onPress={() => setOpenBottomSheet(true)} mt={"20px"} h={60} px={"15px"} _pressed={{ opacity: 0.5 }} flexDirection={"row"} bg={colors.lightGray} justifyContent={"space-between"} alignItems={"center"} borderRadius={10}>
                        {Object.keys(selectedCompany).length > 0 ? (
                            <HStack justifyContent={"space-between"} w={"100%"} alignItems={"center"}>
                                <HStack alignItems={"center"}>
                                    <Image w={"40px"} h={"40px"} borderRadius={100} resizeMode='contain' source={{ uri: selectedCompany.logo }} />
                                    <Heading px={"10px"} fontSize={18} color={colors.white}>{selectedCompany.name}</Heading>
                                </HStack>
                                <Entypo name="chevron-down" size={24} color={colors.white} />
                            </HStack>
                        ) : (
                            <HStack justifyContent={"space-between"} w={"100%"} alignItems={"center"}>
                                <Text fontSize={15} color={colors.gray}>Seleccione una compañia</Text>
                                <Entypo name="chevron-down" size={24} color={colors.gray} />
                            </HStack>
                        )}
                    </Pressable>
                    <HStack w={"100%"} mt={"30px"} justifyContent={"center"} alignItems={"center"}>
                        <Input
                            h={60}
                            style={isAValidPhoneNumber(phoneNumber) ? styles.InputsSucess : phoneNumber ? styles.InputsFail : {}}
                            maxLength={14}
                            value={phoneNumber.length === 10 ? FORMAT_PHONE_NUMBER(phoneNumber) : phoneNumber}
                            isInvalid={(!isAValidPhoneNumber(phoneNumber) && Boolean(phoneNumber.length === 10))}
                            errorMessage='Este no es un numero no es de República Dominicana'
                            keyboardType="phone-pad"
                            onChangeText={(value) => onChangeText(value.replaceAll(/[^0-9]/g, ''))}
                            placeholder="Numero De Telefono*"
                        />
                    </HStack>
                </VStack>

                <HStack w={"100%"} mb={"30px"} justifyContent={"center"} alignItems={"center"}>                    
                    <Button
                        onPress={() => { }} title={"Siguientes"}
                        w={"80%"}
                        h={"50px"}
                        bg={colors.mainGreen}
                        color={colors.white}
                    />
                    <BottomSheet height={height * 0.5} open={openBottomSheet} onCloseFinish={onCloseFinish}>
                        <HStack p={"10px"} pt={"20px"} flexWrap={"wrap"} justifyContent={"space-between"} alignItems={"center"}>
                            {topUpCompanies.map((company) => (
                                <Pressable onPress={() => onCompanySelect(company)} h={120} w={"49%"} my={"3px"} key={company.name} px={"15px"} _pressed={{ opacity: 0.5 }} bg={colors.lightGray} justifyContent={"center"} alignItems={"center"} borderRadius={10}>
                                    <Image w={"45px"} h={"45px"} borderRadius={100} resizeMode='contain' source={{ uri: company.logo }} />
                                    <Heading mt={"5px"} fontSize={18} color={colors.white}>{company.name}</Heading>
                                </Pressable>
                            ))}
                        </HStack>
                    </BottomSheet>
                </HStack>
            </VStack >
        </TouchableWithoutFeedback>

    )
}

export default CreateTopUp

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

