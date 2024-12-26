import React, { useCallback, useEffect, useState } from 'react'
import colors from '@/colors'
import { Text, HStack, Image, Pressable, ScrollView, Heading } from 'native-base'
import { topupPhones } from '@/mocks'
import { scale } from 'react-native-size-matters'
import { FORMAT_PHONE_NUMBER } from '@/helpers'
import { RefreshControl } from 'react-native'
import { router } from 'expo-router'
import { useDispatch } from 'react-redux'
import { topupActions } from '@/redux/slices/topupSlice'
import { useLazyQuery } from '@apollo/client'
import { TopUpApolloQueries } from '@/apollo/query'
import { TopUpAuthSchema } from '@/auth/topUpAuth'
import { z } from 'zod'


const Topups: React.FC = () => {
    const [getTopUps] = useLazyQuery(TopUpApolloQueries.userTopUps());
    const dispatch = useDispatch();

    const [refreshing, setRefreshing] = useState(false);
    const [topups, setTopUps] = useState<z.infer<typeof TopUpAuthSchema.topUp>[]>([]);

    const fetchTopUpPhones = async (page: number = 1, pageSize: number = 10) => {
        try {
            const { data } = await getTopUps({
                variables: {
                    page,
                    pageSize
                }
            });

            setTopUps(data.userTopUps)

        } catch (error) {

        }
    }

    const onRefresh = useCallback(async () => {
        try {
            setRefreshing(true);

            await fetchTopUpPhones();

            setTimeout(() => {
                setRefreshing(false);
            }, 1000);

        } catch (error) {
            console.log(error);
        }

    }, []);

    const onSelectedPhone = async (phone: any) => {
        await dispatch(topupActions.setTopUp(phone))
        router.navigate("/topUpTransactions")
    }

    useEffect(() => {
        fetchTopUpPhones()
    }, [])

    return (
        <ScrollView flex={1} p={"20px"} bg={colors.darkGray} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
            <HStack mt={"50px"} w={"100%"} flexWrap={"wrap"} justifyContent={"space-between"}>
                {topups.map((topUp) => (
                    <Pressable key={topUp.phone} onPress={() => onSelectedPhone(topUp)} _pressed={{ opacity: 0.5 }} mb={"10px"} p={"10px"} justifyContent={"center"} alignItems={"center"} borderRadius={"10px"} w={"48%"} h={"140px"} bg={colors.lightGray}>
                        <Image borderRadius={"100px"} w={"50px"} h={"50px"} alt={`${topUp.phone}`} resizeMode='contain' source={{ uri: topUp.providerLogo }} />
                        <Heading mt={"10px"} fontSize={scale(14)} color={colors.white}>{topUp.fullName}</Heading>
                        <Text fontSize={scale(12)} color={colors.white}>{FORMAT_PHONE_NUMBER(topUp.phone)}</Text>
                    </Pressable>
                ))}
            </HStack>
        </ScrollView>
    )
}

export default Topups