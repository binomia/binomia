import React, { useState } from 'react'
import colors from '@/colors'
import { Heading, Image, Text, VStack, HStack, Avatar } from 'native-base'
import { EXTRACT_FIRST_LAST_INITIALS, FORMAT_CURRENCY, GENERATE_RAMDOM_COLOR_BASE_ON_TEXT, MAKE_FULL_NAME_SHORTEN } from '@/helpers'
import { scale } from 'react-native-size-matters';
import Button from '@/components/global/Button';
import { useDispatch, useSelector } from 'react-redux';
import KeyNumberPad from '../global/KeyNumberPad';
import { transactionActions } from '@/redux/slices/transactionSlice';
import { TransactionAuthSchema } from '@/auth/transactionAuth';


type Props = {
    onSendFinish?: () => any
    onCloseFinish?: () => void
    nextPage?: () => void
    input: string
    title?: string
    showBalance?: boolean
    setInput: (_: string) => void
}

const CreateTransaction: React.FC<Props> = ({ input, title = "Siguiente", showBalance = true, setInput, nextPage = () => { } }) => {
    const dispatch = useDispatch();
    const { receiver } = useSelector((state: any) => state.transactionReducer)
    const { account } = useSelector((state: any) => state.accountReducer)
    const [showPayButton, setShowPayButton] = useState<boolean>(false);

    const onNextPage = async () => {
        try {
            const transactionData = await TransactionAuthSchema.createTransactionDetails.parseAsync({
                username: receiver.username,
                profileImageUrl: receiver.profileImageUrl,
                fullName: receiver.fullName,
                isFromMe: false,
                amount: parseFloat(input),
            })

            await dispatch(transactionActions.setTransactionDetails(transactionData))
            nextPage()

        } catch (error) {
            console.log(error);
        }
    }

    const onChange = (value: string) => {
        if (Number(value) >= 10 && !showBalance)
            setShowPayButton(true)
        else if (Number(value) >= 10 && Number(value) <= account.balance)
            setShowPayButton(true)
        else
            setShowPayButton(false)

        setInput(value)
    }

    return (
        <VStack flex={1} pb={"10px"} justifyContent={"space-between"}>
            <VStack>
                {showBalance ? <HStack w={"100%"} mt={"10px"} alignItems={"center"} justifyContent={"center"}>
                    <Heading size={"md"} color={colors.mainGreen} textAlign={"center"}>{FORMAT_CURRENCY(account.balance)}</Heading>
                </HStack> : null}
                <HStack px={"20px"} mt={"30px"} alignItems={"center"} justifyContent={"space-between"}>
                    <HStack space={2}>
                        {receiver.profileImageUrl ?
                            <Image borderRadius={100} resizeMode='contain' alt='logo-image' w={"50px"} h={"50px"} source={{ uri: receiver.profileImageUrl }} />
                            :
                            <Avatar borderRadius={100} w={"50px"} h={"50px"} bg={GENERATE_RAMDOM_COLOR_BASE_ON_TEXT(receiver?.fullName || "")}>
                                <Heading size={"sm"} color={colors.white}>
                                    {EXTRACT_FIRST_LAST_INITIALS(receiver?.fullName || "0")}
                                </Heading>
                            </Avatar>
                        }
                        <VStack justifyContent={"center"}>
                            <Heading textTransform={"capitalize"} fontSize={scale(15)} color={"white"}>{MAKE_FULL_NAME_SHORTEN(receiver?.fullName || "")}</Heading>
                            <Text fontSize={scale(14)} color={colors.lightSkyGray}>{receiver?.username}</Text>
                        </VStack>
                    </HStack>
                    <Button
                        opacity={showPayButton ? 1 : 0.5}
                        fontSize={scale(12) + "px"}
                        disabled={!showPayButton}
                        onPress={onNextPage}
                        h={"45px"}
                        w={"120px"}
                        title={title}
                        bg={showPayButton ? "mainGreen" : "lightGray"}
                        borderRadius={100}
                        color={showPayButton ? colors.white : colors.mainGreen}
                    />
                </HStack>
            </VStack>
            <VStack mb={"10px"}>
                <KeyNumberPad onChange={(value: string) => onChange(value)} />
            </VStack>
        </VStack>
    )
}

export default CreateTransaction
