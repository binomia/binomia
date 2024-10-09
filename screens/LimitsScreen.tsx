import React, { useEffect } from 'react'
import { VStack, Text, HStack, FlatList, ZStack } from 'native-base'
import { useSelector } from 'react-redux'
import colors from '@/colors'
import { scale } from 'react-native-size-matters'
import CircularProgress from 'react-native-circular-progress-indicator';
import { FORMAT_CURRENCY } from '@/helpers'


const LimitsScreen: React.FC = () => {
    const { user, account } = useSelector((state: any) => state.globalReducer)

    const formatLimit = (amount: number, limit: number) => {
        if (amount === 0)
            return String(0)

        return parseFloat(String((amount / limit) * 100)).toFixed(0)
    }

    const data = [
        {
            title: `Enviado ${FORMAT_CURRENCY(account.sentAmount)} de ${FORMAT_CURRENCY(account.withdrawLimit)}`,
            value: account.sentAmount,
            percentage: formatLimit(account.sentAmount, account.withdrawLimit)

        },
        {
            title: `Recibido ${FORMAT_CURRENCY(account.receivedAmount)} de ${FORMAT_CURRENCY(account.receiveLimit)}`,
            value: account.receivedAmount,
            percentage: formatLimit(account.receivedAmount, account.receiveLimit)
        },
        {
            title: `Retirado ${FORMAT_CURRENCY(account.withdrawAmount)} de ${FORMAT_CURRENCY(account.withdrawLimit)}`,
            value: account.withdrawAmount,
            percentage: formatLimit(account.withdrawAmount, account.withdrawLimit)

        }
    ]

    useEffect(() => {
        console.log(JSON.stringify(account, null, 2));
    }, [])

    return (
        <VStack px={"20px"} variant={"body"} justifyContent={"space-between"} h={"100%"}>
            <VStack borderRadius={10} w={"100%"} h={"auto"} mt={"50px"}>
                <FlatList
                    bg={"lightGray"}
                    borderRadius={10}
                    px={"10px"}
                    data={data}
                    scrollEnabled={false}
                    keyExtractor={(index) => index.toString()}
                    renderItem={({ item }) => (
                        <HStack bg={"lightGray"} w={"100%"} space={2} pl={"10px"} py={"18px"} >
                            <HStack bg={"gray"} w={"35px"} h={"35px"} borderRadius={100} justifyContent={"center"} alignItems={"center"}>
                                <CircularProgress
                                    radius={25}
                                    showProgressValue={false}
                                    value={Number(item.percentage)}
                                    title={`${item.percentage}%`}
                                    titleStyle={{ color: colors.white, fontSize: 10, fontWeight: "bold" }}
                                    circleBackgroundColor={colors.lightGray}
                                    inActiveStrokeColor={colors.mainGreen}
                                    inActiveStrokeOpacity={0.2}
                                    activeStrokeWidth={5}
                                />
                            </HStack>
                            <VStack flex={1} px={"10px"}>
                                <HStack justifyContent={"space-between"} alignItems={"center"}>
                                    <HStack h={"30px"} borderRadius={10} alignItems={"center"} justifyContent={"space-between"}>
                                        <Text numberOfLines={3} fontSize={scale(13)} color={colors.white}>{item.title}</Text>
                                    </HStack>
                                </HStack>
                                <ZStack w={"100%"} h={"7px"} bg={colors.darkGray} borderRadius={10}>
                                    <HStack w={`${item.percentage}%`} h={`100%`} borderRadius={10} bg={colors.mainGreen} />
                                </ZStack>
                            </VStack>
                        </HStack>
                    )} />
            </VStack>
        </VStack>
    )
}

export default LimitsScreen