import React, { useEffect, useState } from 'react'
import colors from '@/colors'
import Input from '@/components/global/Input'
import DefaultIcon from 'react-native-default-icon';
import { StyleSheet, SafeAreaView, Dimensions, TouchableOpacity } from 'react-native'
import { Heading, Image, Text, VStack, HStack, Stack } from 'native-base'

import { GENERATE_RAMDOM_COLOR_BASE_ON_TEXT, MAKE_FULL_NAME_SHORTEN } from '@/helpers'
import { useSqlite } from '@/hooks/useSqlite';
import { scale } from 'react-native-size-matters';
import BottomSheet from '@/components/global/BottomSheet';
import Ionicons from '@expo/vector-icons/Ionicons';
import Button from '@/components/global/Button';
import { useDispatch, useSelector } from 'react-redux';
import KeyNumberPad from '../global/KeyNumberPad';
import { transactionActions } from '@/redux/slices/transactionSlice';
import { useMutation } from '@apollo/client';
import { TransactionApolloQueries } from '@/apollo/query/transactionQuery';

type Props = {
    title?: string
    open?: boolean
    onSendFinish?: () => any
    onCloseFinish?: () => void
}

const { height } = Dimensions.get('window')
const DepositOrWithdrawTransaction: React.FC<Props> = ({ title = "Deposito", open = false, onSendFinish = () => { }, onCloseFinish = () => { } }) => {
    const dispatch = useDispatch();
    const { receiver } = useSelector((state: any) => state.transactionReducer)
    const { card } = useSelector((state: any) => state.globalReducer)
    const [createTransaction] = useMutation(TransactionApolloQueries.createTransaction())

    const [input, setInput] = useState<string>("0");
    const [visible, setVisible] = useState<boolean>(open);


    const handleOnClose = async () => {
        await dispatch(transactionActions.setReceiver({}))

        onCloseFinish()
        setVisible(false)
    }

    useEffect(() => {
        setVisible(open)
    }, [open])

    return (
        <BottomSheet  openTime={300} height={height} onCloseFinish={() => handleOnClose()} open={visible}>
            <VStack py={"40px"} h={"100%"} justifyContent={"space-between"}>
                <VStack>
                    <HStack mb={"20px"} space={5} px={"10px"} justifyContent={"space-between"}>
                        <TouchableOpacity onPress={() => handleOnClose()}>
                            <Stack w={"50px"}>
                                <Ionicons name="chevron-back-outline" size={30} color="white" />
                            </Stack>
                        </TouchableOpacity>
                        <Stack>
                            <Heading size={"sm"} color={colors.white} textAlign={"center"}>{title}</Heading>
                        </Stack>
                        <Stack w={"50px"} />
                    </HStack>
                    <HStack px={"20px"} mt={"20px"} alignItems={"center"} justifyContent={"space-between"} mb={"20px"}>
                        <HStack space={2}>
                            <Image borderRadius={100} resizeMode='contain' alt='logo-image' w={"50px"} h={"50px"} source={{ uri: card?.logo }} />
                            <VStack justifyContent={"center"}>
                                <Heading textTransform={"capitalize"} fontSize={scale(15)} color={"white"}>{card?.brand} {card?.last4Digits}</Heading>
                                <Text color={colors.pureGray}>{card?.bankName}</Text>
                            </VStack>
                            <TouchableOpacity onPress={() => handleOnClose()}>
                                <Stack w={"50px"}>
                                    <Ionicons name="chevron-forward-outline" size={30} color="white" />
                                </Stack>
                            </TouchableOpacity>
                        </HStack>
                        <Button opacity={Number(input) > 0 ? 1 : 0.5} disabled={Number(input) <= 0} onPress={onSendFinish} h={"40px"} w={"110px"} title={title === "Deposito" ? "Depositar" : "Retirar"} bg={Number(input) > 0 ? "mainGreen" : "lightGray"} borderRadius={100} color={Number(input) > 0 ? colors.white : colors.mainGreen} />
                    </HStack>
                </VStack>
                <VStack mb={"20px"}>
                    <KeyNumberPad
                        onChange={(value: string) => {
                            setInput(value);
                        }}
                    />
                </VStack>
            </VStack>
        </BottomSheet>
    )
}

export default DepositOrWithdrawTransaction


const styles = StyleSheet.create({
    contentContainerStyle: {
        width: 55,
        height: 55,
        borderRadius: 100
    },
    textStyle: {
        fontSize: 30,
        color: 'white',
        marginBottom: 2,
        textTransform: 'capitalize',
        fontWeight: 'bold',
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    }
})