import React, { useCallback, useEffect, useState } from 'react'
import colors from '@/colors'
import { Text, Image, Pressable, Heading, VStack } from 'native-base'
import { scale } from 'react-native-size-matters'
import { FORMAT_PHONE_NUMBER } from '@/helpers'
import { Dimensions, RefreshControl, StyleSheet } from 'react-native'
import { router, useNavigation } from 'expo-router'
import { useDispatch, useSelector } from 'react-redux'
import { topupActions } from '@/redux/slices/topupSlice'
import { useLazyQuery } from '@apollo/client'
import { TopUpApolloQueries } from '@/apollo/query'
import { TopUpAuthSchema } from '@/auth/topUpAuth'
import { z } from 'zod'
import { noTransactions } from '@/assets'
import { AntDesign } from '@expo/vector-icons';
import NewTopUp from '@/components/topups/NewTopUp'
import { FlatGrid } from 'react-native-super-grid';



const { height, width } = Dimensions.get('window')
const Topups: React.FC = () => {
    const { hasNewTransaction } = useSelector((state: any) => state.topupReducer)
    const [userTopUps] = useLazyQuery(TopUpApolloQueries.userTopUps());
    const dispatch = useDispatch();
    const navigation = useNavigation();
    const isFocused = navigation.isFocused()

    const [refreshing, setRefreshing] = useState(false);
    const [openBottomSheet, setOpenBottomSheet] = useState(false);
    const [topups, setTopUps] = useState<z.infer<typeof TopUpAuthSchema.topUp>[]>([]);

    const fetchTopUpPhones = async (page: number = 1, pageSize: number = 10) => {
        try {
            const { data } = await userTopUps({
                variables: {
                    page,
                    pageSize
                }
            });

            setTopUps(data.userTopUps)

            if (data.userTopUps.length < 1)
                navigation.setOptions({
                    headerRight: undefined
                });

        } catch (error) {
            console.log(error);
        }
    }

    const onRefresh = useCallback(async () => {
        try {
            setRefreshing(true);

            await fetchTopUpPhones();
            await dispatch(topupActions.setHasNewTransaction(false))

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

    const onClose = (newTopUp?: z.infer<typeof TopUpAuthSchema.topUp> | undefined) => {
        setOpenBottomSheet(false)

        if (newTopUp)
            setTopUps([...topups, newTopUp])
    }


    useEffect(() => {
        fetchTopUpPhones()
    }, [])

    useEffect(() => {
        (async () => {
            if (hasNewTransaction) {
                fetchTopUpPhones()
            }
        })()

    }, [isFocused, hasNewTransaction])


    return (
        <VStack flex={1} bg={colors.darkGray} pt={"20px"}>
            {topups.length > 0 ? (
                <FlatGrid
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                    refreshing={refreshing}
                    itemDimension={width / 3}
                    data={topups}
                    style={styles.gridView}
                    spacing={15}
                    renderItem={({ item: topUp }) => (
                        <Pressable key={topUp.phone} style={[styles.itemContainer]} _pressed={{ opacity: 0.5 }} onPress={() => onSelectedPhone(topUp)}>
                            <Image borderRadius={"100px"} w={"50px"} h={"50px"} alt={`${topUp.phone}`} resizeMode='contain' source={{ uri: topUp.company.logo }} />
                            <Heading mt={"10px"} textTransform={"capitalize"} fontSize={scale(14)} color={colors.white}>{topUp.fullName}</Heading>
                            <Text fontSize={scale(12)} color={colors.white}>{FORMAT_PHONE_NUMBER(topUp.phone)}</Text>
                        </Pressable>
                    )}
                />
            ) : (
                <VStack mt={"100px"} w={"100%"} h={height / 3} px={"20px"} justifyContent={"flex-end"} alignItems={"center"}>
                    <Image resizeMode='contain' alt='logo-image' w={"100%"} h={"100%"} source={noTransactions} />
                    <VStack justifyContent={"center"} alignItems={"center"}>
                        <Heading textTransform={"capitalize"} fontSize={scale(20)} color={"white"}>No tienes recargas</Heading>
                        <Text textAlign={"center"} fontSize={scale(14)} color={"white"}>Agrega un nuevo número de teléfono para realizar una recarga</Text>
                    </VStack>
                    <Pressable mt={"30px"} _pressed={{ opacity: 0.5 }} onPress={() => setOpenBottomSheet(true)}>
                        <AntDesign name="pluscircle" size={50} color={colors.mainGreen} />
                    </Pressable>
                </VStack>
            )}
            <NewTopUp onClose={onClose} open={openBottomSheet} />
        </VStack>


    )
}

const styles = StyleSheet.create({
    gridView: {
        flex: 1,
        backgroundColor: colors.darkGray,
    },
    itemContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.lightGray,
        borderRadius: 10,
        padding: 20,
        height: 150,
    }
});

export default Topups