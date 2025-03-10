import React, { useCallback, useContext, useEffect, useState } from 'react'
import colors from '@/colors'
import NewTopUp from '@/components/topups/NewTopUp'
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
import { FlatGrid } from 'react-native-super-grid';
import { TopUpContext } from '@/contexts/topUpContext'



const { height, width } = Dimensions.get('window')
const Topups: React.FC = () => {
    const { setCompany, setFullName, setPhoneNumber, setAmount } = useContext(TopUpContext)

    const { hasNewTransaction } = useSelector((state: any) => state.topupReducer)
    // const [userTopUps] = useLazyQuery(TopUpApolloQueries.userTopUps());
    const [topUpPhones] = useLazyQuery(TopUpApolloQueries.topUpPhones());
    const dispatch = useDispatch();
    const navigation = useNavigation();
    const isFocused = navigation.isFocused()

    const [refreshing, setRefreshing] = useState(false);
    const [openBottomSheet, setOpenBottomSheet] = useState(false);
    const [phones, setPhones] = useState<z.infer<typeof TopUpAuthSchema.phone>[]>([]);

    const fetchTopUpPhones = async (page: number = 1, pageSize: number = 10) => {
        try {
            const { data } = await topUpPhones({
                variables: {
                    page,
                    pageSize
                }
            });            

            setPhones(data.topUpPhones)

            if (data.userTopUps?.length < 1)
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

        setCompany(phone.company)
        setFullName(phone.fullName)
        setPhoneNumber(phone.phone)
        setAmount(phone.amount)

        router.navigate("/topUpTransactions")
    }

    const onClose = (newTopUp?: z.infer<typeof TopUpAuthSchema.phone> | undefined) => {
        setOpenBottomSheet(false)

        if (newTopUp)
            setPhones([...phones, newTopUp])
    }


    useEffect(() => {
        fetchTopUpPhones()
        navigation.addListener("focus", async () => {
            setCompany({})
            setFullName("")
            setPhoneNumber("")
            setAmount(0)
        })

    }, [])

    useEffect(() => {
        (async () => {
            if (hasNewTransaction)
                fetchTopUpPhones()
        })()

    }, [isFocused, hasNewTransaction])


    return (
        <VStack flex={1} bg={colors.darkGray} pt={"20px"}>
            {phones?.length > 0 ? (
                <FlatGrid
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                    refreshing={refreshing}
                    itemDimension={width / 3}
                    data={phones}
                    style={styles.gridView}
                    spacing={15}
                    renderItem={({ item: topUp }) => (
                        <Pressable key={topUp.phone} style={[styles.itemContainer]} _pressed={{ opacity: 0.5 }} onPress={() => onSelectedPhone(topUp)}>
                            <Image borderRadius={"100px"} w={"50px"} h={"50px"} alt={`${topUp.phone}-image`} resizeMode='contain' source={{ uri: topUp.company?.logo }} />
                            <Heading mt={"10px"} textTransform={"capitalize"} fontSize={scale(12)} color={colors.white}>{topUp.fullName}</Heading>
                            <Text fontSize={scale(11)} color={colors.white}>{FORMAT_PHONE_NUMBER(topUp.phone)}</Text>
                        </Pressable>
                    )}
                />
            ) : (
                <VStack mt={"100px"} w={"100%"} h={height / 3} px={"20px"} justifyContent={"flex-end"} alignItems={"center"}>
                    <Image resizeMode='contain' alt='logo-image-fetchTopUpPhones' w={"100%"} h={"100%"} source={noTransactions} />
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
        height: 130,
    }
});

export default Topups