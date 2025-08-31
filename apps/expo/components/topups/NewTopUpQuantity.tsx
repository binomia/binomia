import React, { useState } from 'react'
import KeyNumberPad from '../global/KeyNumberPad'
import Button from '../global/Button';
import colors from '@/colors';
import { Heading, HStack, VStack, Image, Text, Pressable } from 'native-base'
import { MaterialIcons } from "@expo/vector-icons";
import { useDispatch, useSelector } from 'react-redux';
import { FORMAT_CURRENCY, FORMAT_PHONE_NUMBER } from '@/helpers';
import { scale } from 'react-native-size-matters';
import { topupActions } from '@/redux/slices/topupSlice';



type Props = {
    next: () => void
    back: () => void
}

const NewTopUpQuantity: React.FC<Props> = ({ next, back }: Props) => {
    const dispatch = useDispatch();
    const { newTopUp } = useSelector((state: any) => state.topupReducer)
    const { account } = useSelector((state: any) => state.accountReducer)

    const [showPayButton, setShowPayButton] = useState<boolean>(false);
    const [input, setInput] = useState<string>("0");

    const onNextPage = async () => {
        try {
            await dispatch(topupActions.setNewTopUp({
                ...newTopUp,
                amount: Number(input)
            }))

            next()

        } catch (error) {
            console.log(error);
        }
    }

    const onChange = (value: string) => {
        if (Number(value) >= 20 && Number(value) <= account.balance)
            setShowPayButton(true)
        else
            setShowPayButton(false)

        setInput(value)
    }

    return (
        <VStack px={"20px"} variant={"body"} justifyContent={"space-between"} h={"100%"}>
            <VStack>
                <HStack w={"100%"} mt={"10px"} alignItems={"center"} justifyContent={"space-between"}>
                    <Pressable _pressed={{ opacity: 0.5 }} onPress={() => back()} right={"7px"}>
                        <MaterialIcons name="arrow-back-ios" size={30} color={colors.white} />
                        {/* <Ionicons name="chevron-back-outline" size={35} color={colors.white} /> */}
                    </Pressable>
                    <Heading size={"md"} color={colors.mainGreen} textAlign={"center"}>{FORMAT_CURRENCY(account.balance)}</Heading>
                    <HStack w={"35px"} />
                </HStack>
                <HStack w={"100%"} h={"100px"} justifyContent={"space-between"} alignItems={"center"}>
                    <HStack alignItems={"center"}>
                        <Image w={"40px"} h={"40px"} alt='logo-selectedCompany-image' borderRadius={100} resizeMode='contain' source={{ uri: newTopUp.company?.logo }} />
                        <VStack>
                            <Heading textTransform={"capitalize"} px={"10px"} fontSize={18} color={colors.white}>{newTopUp?.fullName || ""}</Heading>
                            <Text px={"10px"} fontSize={18} color={colors.white}>{FORMAT_PHONE_NUMBER(newTopUp?.phone || "")}</Text>
                        </VStack>
                    </HStack>
                    <Button
                        opacity={showPayButton ? 1 : 0.5}
                        fontSize={scale(12) + "px"}
                        disabled={!showPayButton}
                        onPress={onNextPage}
                        h={"45px"}
                        w={"120px"}
                        title={"Siguiente"}
                        bg={showPayButton ? "mainGreen" : "lightGray"}
                        borderRadius={100}
                        color={showPayButton ? colors.white : colors.mainGreen}
                    />
                </HStack>

            </VStack>
            <KeyNumberPad onChange={(value: string) => onChange(value)} />
        </VStack>
    )
}

export default NewTopUpQuantity