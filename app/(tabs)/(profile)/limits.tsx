import React, { useCallback, useEffect, useState } from 'react'
import { VStack, Text, HStack, ZStack, ScrollView } from 'native-base'
import { useDispatch, useSelector } from 'react-redux'
import colors from '@/colors'
import { scale } from 'react-native-size-matters'
import CircularProgress from 'react-native-circular-progress-indicator';
import { limitsScreenData } from '@/mocks'
import { useLazyQuery } from '@apollo/client'
import { AccountApolloQueries } from '@/apollo/query'
import { AccountLimitsType } from '@/types'
import { AccountAuthSchema } from '@/auth/accountAuth'
import { useNavigation } from 'expo-router'
import { globalActions } from '@/redux/slices/globalSlice'
import { Feather } from '@expo/vector-icons';
import { TEXT_PARAGRAPH_FONT_SIZE } from '@/constants'
import { RefreshControl } from 'react-native'


const LimitsScreen: React.FC = () => {
    const dispatch = useDispatch()

    const isFocused = useNavigation().isFocused()

    const { account, haveAccountChanged } = useSelector((state: any) => state.globalReducer)
    const [accountLimit] = useLazyQuery(AccountApolloQueries.accountLimit())
    const [limits, setLimits] = useState<AccountLimitsType>({} as AccountLimitsType)
    const [refreshing, setRefreshing] = useState(false);



    const fetchAccountLimit = async () => {
        try {
            const { data } = await accountLimit()

            const limitData = await AccountAuthSchema.accountLimits.parseAsync(data.accountLimit)
            setLimits(limitData)

        } catch (error) {
            console.log(error);
        }
    }

    const onRefresh = useCallback(async () => {
        try {
            setRefreshing(true);

            await fetchAccountLimit();

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
                await fetchAccountLimit()
                await dispatch(globalActions.setHaveAccountChanged(false))
            }

        })()

    }, [isFocused, haveAccountChanged])

    useEffect(() => {
        fetchAccountLimit()
    }, [])

    return (
        <VStack px={"20px"} variant={"body"} justifyContent={"space-between"} h={"100%"}>
            <ScrollView borderRadius={10} w={"100%"} h={"auto"} mt={"50px"} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
                <VStack bg={"lightGray"} borderRadius={10} px={"10px"}>
                    {limitsScreenData(limits, account).map((item, index) => (
                        <HStack key={`limits-creen-data-${index}`} bg={"lightGray"} w={"100%"} space={2} pl={"10px"} py={"18px"} >
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
                    ))}
                </VStack>
                <HStack mt={"30px"} >
                    <Feather style={{ marginTop: 5 }} name="alert-circle" size={24} color={colors.warning} />
                    <Text ml={"10px"} fontSize={`${TEXT_PARAGRAPH_FONT_SIZE}px`} w={"85%"} color={colors.warning}>
                        Los recursos de tu cuenta son limitados y se actualizan semanalmente, específicamente cada lunes.
                    </Text>
                </HStack>
            </ScrollView>
        </VStack>
    )
}

export default LimitsScreen