import React, { useCallback, useEffect, useState } from 'react'
import CircularProgress from 'react-native-circular-progress-indicator';
import colors from '@/colors'
import { VStack, Text, HStack, ZStack, ScrollView, Heading } from 'native-base'
import { useDispatch, useSelector } from 'react-redux'
import { scale } from 'react-native-size-matters'
import { limitsScreenData } from '@/mocks'
import { useNavigation } from 'expo-router'
import { MaterialIcons } from '@expo/vector-icons';
import { RefreshControl } from 'react-native'
import { accountActions } from '@/redux/slices/accountSlice'
import { fetchAccountLimit } from '@/redux/fetchHelper'


const LimitsScreen: React.FC = () => {
    const dispatch = useDispatch()
    const isFocused = useNavigation().isFocused()
    const { account, limits, haveAccountChanged } = useSelector((state: any) => state.accountReducer)

    const [refreshing, setRefreshing] = useState(false);

    const onRefresh = useCallback(async () => {
        try {
            setRefreshing(true);
            await dispatch(fetchAccountLimit())

            setTimeout(() => {
                setRefreshing(false);
            }, 1000);
        } catch (error) {
            console.log(error);
        }

    }, []);

    useEffect(() => {
        (async () => {
            if (haveAccountChanged) {
                await dispatch(fetchAccountLimit())
                await dispatch(accountActions.setHaveAccountChanged(false))
            }
        })()

    }, [isFocused, haveAccountChanged])

    return (
        <VStack px={"20px"} flex={1} bg={colors.darkGray} justifyContent={"space-between"}>
            <ScrollView borderRadius={10} w={"100%"} h={"100%"} flex={1} mt={"50px"} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
                <VStack bg={"lightGray"} borderRadius={10} px={"10px"}>
                    {limitsScreenData(limits, account).map((item, index) => (
                        <HStack key={`limits-creen-data-${index}`}  w={"100%"} space={2} pl={"10px"} py={"18px"} >
                            <HStack bg={"gray"} w={"35px"} h={"35px"} borderRadius={100} justifyContent={"center"} alignItems={"center"}>
                                <CircularProgress
                                    radius={28}
                                    showProgressValue={false}
                                    value={Number(item.percentage)}
                                    title={`${item.percentage}%`}
                                    titleStyle={{ color: colors.white, fontSize: 10, fontWeight: "bold" }}
                                    circleBackgroundColor={colors.darkGray}
                                    inActiveStrokeColor={colors.mainGreen}
                                    inActiveStrokeOpacity={0.2}
                                    activeStrokeWidth={5}
                                />
                            </HStack>
                            <VStack h={"30px"} flex={1} px={"10px"}>
                                <HStack h={"20px"} borderRadius={10} alignItems={"center"} justifyContent={"space-between"}>
                                    <Heading fontSize={scale(11)} textTransform={"capitalize"} color={colors.white}>{item.title}</Heading>
                                </HStack>
                                <ZStack w={"100%"} h={"7px"} bg={colors.darkGray} borderRadius={10}>
                                    <HStack w={`${item.percentage}%`} h={`100%`} borderRadius={10} bg={colors.mainGreen} />
                                </ZStack>
                            </VStack>
                        </HStack>
                    ))}
                </VStack>
            </ScrollView>
            <VStack w={"100%"} my={"50px"} bottom={"20px"} alignItems={"center"}>
                <HStack bg={colors.lightGray} w={"40px"} h={"40px"} borderRadius={100} justifyContent={"center"} alignItems={"center"}>
                    <MaterialIcons name="security" size={24} color={colors.mainGreen} />
                </HStack>
                <Text mt={"10px"} w={"80%"} fontSize={scale(12)} textAlign={"center"} color={"white"}>
                    Los fondos de tu cuenta son limitados y se actualizan diariamente, al final de cada día.
                </Text>
            </VStack>
        </VStack>
    )
}

export default LimitsScreen