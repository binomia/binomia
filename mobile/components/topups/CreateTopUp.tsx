import React, { useContext, useEffect, useState } from 'react'
import colors from '@/colors'
import BottomSheet from '@/components/global/BottomSheet'
import Input from '@/components/global/Input'
import Button from '@/components/global/Button'
import phone from 'phone'
import { Dimensions, Keyboard, StyleSheet, TouchableWithoutFeedback } from 'react-native'
import { Heading, Image, Text, VStack, HStack, Pressable } from 'native-base'
import { Entypo } from "@expo/vector-icons";
import { FORMAT_PHONE_NUMBER } from '@/helpers'
import { scale } from 'react-native-size-matters'
import { useDispatch } from 'react-redux'
import { topupActions } from '@/redux/slices/topupSlice'
import { FlatGrid } from 'react-native-super-grid'
import { useLazyQuery } from '@apollo/client'
import { TopUpApolloQueries } from '@/apollo/query'
import { TopUpAuthSchema } from '@/auth/topUpAuth'
import { z } from 'zod'
import { TopUpContext } from '@/contexts/topUpContext'


type Props = {
    next: () => void
}

const { height, width } = Dimensions.get('window')
const CreateTopUp: React.FC<Props> = ({ next }: Props) => {
    const { phoneNumber, fullName, company, setCompany, setFullName, setPhoneNumber } = useContext(TopUpContext)

    const [topUpCompanies] = useLazyQuery(TopUpApolloQueries.topUpCompanies())
    const dispatch = useDispatch()

    const [openBottomSheet, setOpenBottomSheet] = useState(false);
    const [enabledButton, setEnabledButton] = useState(false);
    const [companies, setCompanies] = useState<z.infer<typeof TopUpAuthSchema.company>[]>([]);


    const fetchCompanies = async () => {
        try {
            const { data } = await topUpCompanies()
            setCompanies(data.topUpCompanies)
        } catch (error) {
            console.error({ fetchCompanies: error });
        }
    }


    const onCloseFinish = () => {
        setOpenBottomSheet(false)
    }

    const onCompanySelect = async (company: any) => {
        setCompany(company)
        setOpenBottomSheet(false)
    }

    const isAValidPhoneNumber = (value: string) => {
        const { isValid } = phone(value, { country: "DO" });
        return isValid
    };

    const onNext = async () => {
        await dispatch(topupActions.setNewTopUp({
            logo: company?.logo,
            company: company,
            phone: phoneNumber,
            fullName
        }))
        next()
    }

    useEffect(() => {
        fetchCompanies()
    }, [])

    useEffect(() => {
        setEnabledButton((Boolean(company?.id) && isAValidPhoneNumber(phoneNumber) && fullName?.length > 1))
    }, [company, phoneNumber, fullName])

    return (
        <VStack variant={"body"} justifyContent={"space-between"}>
            <VStack mt={"20px"}>
                <Heading fontSize={scale(24)} color={"white"}>Crear Recarga</Heading>
                <TouchableWithoutFeedback style={{ flex: 1 }} onPress={Keyboard.dismiss}>
                    <VStack h={"70%"}>
                        <Pressable onPress={() => setOpenBottomSheet(true)} mt={"20px"} h={60} px={"15px"} _pressed={{ opacity: 0.5 }} flexDirection={"row"} bg={colors.lightGray} justifyContent={"space-between"} alignItems={"center"} borderRadius={10}>
                            {company?.name ? (
                                <HStack justifyContent={"space-between"} w={"100%"} h={"100%"} alignItems={"center"}>
                                    <HStack alignItems={"center"}>
                                        <Image w={"35px"} h={"35px"} alt='logo-selectedCompany-image' borderRadius={100} resizeMode='contain' source={{ uri: company.logo }} />
                                        <Heading px={"10px"} fontSize={18} color={colors.white}>{company.name}</Heading>
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
                        <VStack w={"100%"} mt={"30px"} justifyContent={"center"} alignItems={"center"}>
                            <Input
                                h={60}
                                style={fullName?.length >= 2 ? styles.InputsSucess : fullName ? styles.InputsFail : {}}
                                value={fullName}
                                onChangeText={(value) => setFullName(value)}
                                placeholder={"Nombre Completo*"}
                            />
                            <Input
                                h={60}
                                style={isAValidPhoneNumber(phoneNumber) ? styles.InputsSucess : phoneNumber ? styles.InputsFail : {}}
                                maxLength={14}
                                value={phoneNumber?.length === 10 ? FORMAT_PHONE_NUMBER(phoneNumber) : phoneNumber}
                                isInvalid={(!isAValidPhoneNumber(phoneNumber) && Boolean(phoneNumber?.length === 10))}
                                errorMessage='Este no es un numero no es de República Dominicana'
                                keyboardType="phone-pad"
                                onChangeText={(value) => setPhoneNumber(value.replaceAll(/[^0-9]/g, ''))}
                                placeholder="Numero De Telefono*"
                            />
                        </VStack>
                    </VStack>
                </ TouchableWithoutFeedback>
            </VStack>
            <HStack w={"100%"} mb={"30px"} justifyContent={"center"} alignItems={"center"}>
                <Button
                    title={"Siguiente"}
                    onPress={onNext}
                    w={"80%"}
                    h={"50px"}
                    bg={enabledButton ? colors.mainGreen : colors.lightGray}
                    color={enabledButton ? colors.white : colors.mainGreen}
                    disabled={!enabledButton}
                    opacity={!enabledButton ? 0.5 : 1}
                />
                <BottomSheet height={height * 0.5} open={openBottomSheet} onCloseFinish={onCloseFinish}>
                    <HStack mt={"20px"} px={"20px"}>
                        <Heading fontSize={scale(18)} color={"white"}>Compañias</Heading>
                    </HStack>
                    <FlatGrid
                        itemDimension={width / 4}
                        data={companies}
                        style={styles.gridView}
                        spacing={15}
                        renderItem={({ item: company }) => (
                            <Pressable onPress={() => onCompanySelect(company)} h={120} my={"3px"} key={company?.name} px={"15px"} _pressed={{ opacity: 0.5 }} bg={colors.lightGray} justifyContent={"center"} alignItems={"center"} borderRadius={10}>
                                <Image w={"45px"} h={"45px"} alt='logo-topUpCompanies-BottomSheet-image' borderRadius={100} resizeMode='contain' source={{ uri: company?.logo }} />
                                <Heading mt={"5px"} fontSize={18} color={colors.white}>{company?.name}</Heading>
                            </Pressable>
                        )}
                    />
                </BottomSheet>
            </HStack>
        </VStack >


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
    },
    gridView: {
        flex: 1,
        backgroundColor: colors.darkGray,
    }
});


