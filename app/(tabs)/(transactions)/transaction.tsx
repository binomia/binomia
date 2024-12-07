import React, { useEffect, useRef, useState } from 'react'
import colors from '@/colors'
import DefaultIcon from 'react-native-default-icon';
import { StyleSheet, Dimensions, ScrollView } from 'react-native'
import { Heading, Image, Text, VStack, HStack, Pressable, ZStack } from 'native-base'
import { FORMAT_CURRENCY, GENERATE_RAMDOM_COLOR_BASE_ON_TEXT, getMapLocationImage, MAKE_FULL_NAME_SHORTEN } from '@/helpers'
import { scale } from 'react-native-size-matters';
import BottomSheet from '@/components/global/BottomSheet';
import Button from '@/components/global/Button';
import { useDispatch, useSelector } from 'react-redux';
import Entypo from '@expo/vector-icons/Entypo';
import * as Sharing from 'expo-sharing';
import moment from 'moment';
import { useMutation } from '@apollo/client';
import { TransactionApolloQueries } from '@/apollo/query/transactionQuery';
import { globalActions } from '@/redux/slices/globalSlice';
import { transactionActions } from '@/redux/slices/transactionSlice';
import { transactionStatus } from '@/mocks';
import PagerView from 'react-native-pager-view';
import { KeyboardAvoidingScrollView } from '@cassianosch/react-native-keyboard-sticky-footer-avoiding-scroll-view';


type Props = {
    title?: string
    goNext?: (_?: number) => void,
    showPayButton?: boolean
    iconImage?: any

}

const { height, width } = Dimensions.get('window')
const Transaction: React.FC<Props> = ({ title = "Ver Detalles", iconImage, showPayButton = false, goNext = (_?: number) => { } }) => {
    const ref = useRef<PagerView>(null);
    const dispatch = useDispatch()
    const { transaction } = useSelector((state: any) => state.transactionReducer)
    const { account, user, location } = useSelector((state: any) => state.globalReducer)
    const [openDetail, setOpenDetail] = useState<boolean>(false)
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [isCancelLoading, setIsCancelLoading] = useState<boolean>(false)
    const [isCancelled, setIsCancelled] = useState<boolean>(false)
    const [payRequestTransaction] = useMutation(TransactionApolloQueries.payRequestTransaction());

    const details = [
        {
            title: "Fecha",
            value: moment(Number(transaction?.createdAt)).format("lll")
        },
        {
            title: "Enviado a",
            value: transaction?.fullName
        },
        {
            title: "Monto",
            value: transaction?.amount
        }
    ]

    const handleValue = (title: string, value: string) => {
        if (title === "Monto")
            return {
                title,
                value: FORMAT_CURRENCY(Number(value)),
                color: amountColor(transaction)
            }

        if (title === "Enviado a")
            return {
                title: transaction?.isFromMe ? title : "Enviado por",
                value,
                color: colors.white
            }

        return {
            title,
            value,
            color: colors.white
        }
    }

    const handleShare = async () => {
        const isAvailableAsync = await Sharing.isAvailableAsync()
        if (!isAvailableAsync) return

        await Sharing.shareAsync("http://test.com")
    }

    const formatTransaction = (transaction: any) => {
        const isFromMe = transaction?.from.user?.id === user.id

        const profileImageUrl = isFromMe ? transaction?.to.user?.profileImageUrl : transaction?.from.user?.profileImageUrl
        const fullName = isFromMe ? transaction?.to.user?.fullName : transaction?.from.user?.fullName
        const username = isFromMe ? transaction?.from.user?.username : transaction?.to.user?.username
        const showPayButton = transaction?.transactionType === "request" && !isFromMe && transaction?.status === "pending"
        const amountColor = (transaction?.transactionType === "request" && isFromMe) ? colors.mainGreen : colors.red

        return {
            isFromMe,
            amountColor,
            profileImageUrl: profileImageUrl || "",
            amount: transaction?.amount,
            showPayButton,
            fullName: fullName || "",
            username: username || ""
        }
    }

    const onPress = async (paymentApproved: boolean) => {
        if (transaction?.showPayButton) {
            try {
                setIsCancelLoading(!paymentApproved)
                setIsLoading(paymentApproved)

                const { data } = await payRequestTransaction({
                    variables: {
                        transactionId: transaction?.transactionId,
                        paymentApproved
                    }
                })

                await dispatch(transactionActions.setTransaction(Object.assign({}, transaction, { ...data.payRequestTransaction, ...formatTransaction(data.payRequestTransaction) })))
                await dispatch(globalActions.setAccount(Object.assign({}, account, { balance: Number(account.balance) - Number(transaction?.amount) })))

                setIsLoading(false)
                setIsCancelLoading(false)
                setIsCancelled(paymentApproved)
                goNext(paymentApproved ? 1 : 2)

            } catch (error) {
                setIsLoading(false)
                console.log({ payRequestTransaction: error });
            }

        } else
            ref.current?.setPage(1)
    }


    const amountColor = (transaction: any) => {
        if (transaction?.status === "cancelled")
            return colors.red

        if (transaction?.status === "pending")
            return colors.pureGray

        return colors.mainGreen
    }

    return (
        <VStack variant={"body"} bg={colors.darkGray} >
            <VStack pt={"40px"}>
                <HStack w={"100%"} mb={"20px"} justifyContent={"space-between"} alignItems={"center"}>
                    <HStack>
                        {transaction?.profileImageUrl ?
                            <Image borderRadius={100} resizeMode='contain' alt='logo-image' w={scale(50)} h={scale(50)} source={{ uri: transaction?.profileImageUrl }} />
                            :
                            <DefaultIcon
                                value={transaction?.fullName || ""}
                                contentContainerStyle={[styles.contentContainerStyle, { width: scale(width / 4), height: scale(width / 4), backgroundColor: GENERATE_RAMDOM_COLOR_BASE_ON_TEXT(transaction?.fullName || "") }]}
                                textStyle={styles.textStyle}
                            />
                        }
                        <VStack ml={"10px"} >
                            <Heading textTransform={"capitalize"} fontSize={scale(20)} color={"white"}>{MAKE_FULL_NAME_SHORTEN(transaction?.fullName || "")}</Heading>
                            <Text fontSize={scale(15)} color={colors.lightSkyGray}>{transaction?.username}</Text>
                        </VStack>
                    </HStack>

                    <Pressable mb={"20px"} _pressed={{ opacity: 0.5 }} bg={colors.lightGray} onPress={handleShare} w={"40px"} h={"40px"} borderRadius={100} alignItems={"center"} justifyContent={"center"}>
                        <Entypo name="share" size={20} color={colors.mainGreen} />
                    </Pressable>
                </HStack>
                <VStack >
                    <VStack mt={"20px"} alignItems={"center"}>
                        <Heading textTransform={"capitalize"} fontSize={scale(36)} color={amountColor(transaction)}>{FORMAT_CURRENCY(transaction?.amount)}</Heading>
                        <Text mb={"10px"} color={colors.lightSkyGray}>{moment(Number(transaction?.createdAt)).format("lll")}</Text>
                        <HStack mb={"40px"} space={1} alignItems={"center"}>
                            <ZStack w={"20px"} h={"20px"} borderRadius={100} justifyContent={"center"} alignItems={"center"} >
                                <HStack w={"80%"} h={"80%"} bg={colors.mainGreen} borderRadius={100} />
                                <Image borderRadius={100} alt='logo-image' w={"20px"} h={"20px"} source={iconImage} />
                            </ZStack>
                            <Text fontSize={scale(14)} fontWeight={"bold"} color={colors.white}>{transactionStatus(transaction?.status)}</Text>
                        </HStack>


                    </VStack>
                    {showPayButton ?
                        <HStack mb={"50px"} px={"20px"} justifyContent={showPayButton ? "space-between" : "center"}>
                            <Button onPress={() => onPress(false)} spin={isCancelLoading} w={"49%"} bg={colors.lightGray} color={colors.red} title={"Cancelar"} />
                            <Button onPress={() => onPress(true)} spin={isLoading} w={showPayButton ? "49%" : "80%"} bg={colors.mainGreen} color={colors.white} title={title} />
                        </HStack>
                        : null
                    }
                </VStack>
            </VStack>
            <VStack w={"100%"} mt={"20px"}  justifyContent={"center"}>
                <HStack>
                    <Heading fontSize={scale(18)} textTransform={"capitalize"} color={"white"}>Guaricano, Villa Mella, Santo Domingo Norte</Heading>
                </HStack>
                <Image
                    alt='fine-location-image-alt'
                    resizeMode="cover"
                    w={"100%"}
                    h={scale(height * 0.20)}
                    source={{
                        uri: getMapLocationImage({ latitude: transaction?.location?.latitude, longitude: transaction?.location?.longitude })
                    }}
                    style={{
                        borderRadius: 10
                    }}
                />
            </VStack>

        </VStack>
    )
}

export default Transaction


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