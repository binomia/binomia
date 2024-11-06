import React, { useEffect, useState } from 'react'
import colors from '@/colors'
import { Dimensions, TouchableOpacity, SafeAreaView } from 'react-native'
import { Heading, Image, Text, VStack, HStack, Stack, Pressable } from 'native-base'
import { scale } from 'react-native-size-matters';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useDispatch, useSelector } from 'react-redux';
import KeyNumberPad from '@/components/global/KeyNumberPad';
import { transactionActions } from '@/redux/slices/transactionSlice';
import { useMutation } from '@apollo/client';
import { TransactionApolloQueries } from '@/apollo/query/transactionQuery';
import Cards from '@/components/cards';
import { depositIcon } from '@/assets';
import { useNavigation } from '@react-navigation/native';


type Props = {
    title?: string
    open?: boolean
    onSendFinish?: () => any
    onCloseFinish?: () => void
}

const { height } = Dimensions.get('window')
const DepositOrWithdrawTransaction: React.FC<Props> = ({ title = "Deposito", open = true, onSendFinish = () => { }, onCloseFinish = () => { } }) => {
    const dispatch = useDispatch();
    const navigation = useNavigation<any>()

    const { receiver } = useSelector((state: any) => state.transactionReducer)
    const { card } = useSelector((state: any) => state.globalReducer)
    const [createTransaction] = useMutation(TransactionApolloQueries.createTransaction())

    const [input, setInput] = useState<string>("0");
    const [visible, setVisible] = useState<boolean>(open);
    const [showAllCards, setShowAllCards] = useState<boolean>(false)
    const [showPayButton, setShowPayButton] = useState<boolean>(false);


    const onChange = (value: string) => {
        console.log(value);

        if (Number(value) >= 10)
            setShowPayButton(true)
        else
            setShowPayButton(false)

        setInput(value)
    }

    const handleOnClose = async () => {
        await dispatch(transactionActions.setReceiver({}))

        onCloseFinish()
        setVisible(false)
        navigation.goBack()
    }

    useEffect(() => {
        setVisible(open)
    }, [open])

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.darkGray }}>
            <VStack px={"10px"} w={"100%"} h={"100%"} justifyContent={"space-between"}>
                <HStack mt={"3px"} alignItems={"center"} justifyContent={"space-between"}>
                    <Stack>
                        <TouchableOpacity onPress={() => handleOnClose()}>
                            <Ionicons name="close" size={30} color="white" />
                        </TouchableOpacity>
                    </Stack>
                    <Pressable onPress={() => setShowAllCards(true)} _pressed={{ opacity: 0.5 }}  flexDirection={"row"}  alignItems={"center"}>
                        <Image mr={"10px"} borderRadius={100} resizeMode='contain' alt='logo-image' w={scale(40)} h={scale(40)} source={{ uri: card?.logo }} />
                        <VStack justifyContent={"center"}>
                            <Heading textTransform={"capitalize"} fontSize={scale(13)} color={"white"}>{card?.brand} {card?.last4Digits}</Heading>
                            <Text fontSize={scale(13)} color={colors.pureGray}>{card?.bankName}</Text>
                        </VStack>
                        <Ionicons style={{ marginBottom: 20 }}  name="chevron-forward" size={25} color={colors.gray} />
                    </Pressable>
                    <Pressable opacity={showPayButton ? 1 : 0.5} disabled={!showPayButton} shadow={2} w={scale(50)} h={scale(50)} justifyContent={"center"} alignItems={"center"} _pressed={{ opacity: 0.5 }} bg={showPayButton ? "mainGreen" : "lightGray"} p={"5px"} borderRadius={100}>
                        <Image alt='logo-image' tintColor={showPayButton ? colors.white : colors.mainGreen} resizeMode='contain' w={scale(25)} h={scale(25)} source={depositIcon} />
                    </Pressable>
                </HStack>
                <VStack mt={"20px"}>
                    <KeyNumberPad onChange={(value: string) => onChange(value)} />
                </VStack>
                <Cards justSelecting={true} onCloseFinish={() => setShowAllCards(false)} open={showAllCards} />
            </VStack>
        </SafeAreaView>
    )
}

export default DepositOrWithdrawTransaction