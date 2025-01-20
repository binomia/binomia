import React, { useEffect, useRef, useState } from 'react'
import colors from '@/colors'
import Input from '@/components/global/Input'
import DefaultIcon from 'react-native-default-icon';
import { StyleSheet, SafeAreaView, Keyboard, TouchableWithoutFeedback, TouchableOpacity, Dimensions } from 'react-native'
import { Heading, Image, Text, VStack, FlatList, HStack } from 'native-base'
import { useLazyQuery } from '@apollo/client'
import { UserApolloQueries } from '@/apollo/query'
import { UserAuthSchema } from '@/auth/userAuth'
import { z } from 'zod'
import { GENERATE_RAMDOM_COLOR_BASE_ON_TEXT, MAKE_FULL_NAME_SHORTEN } from '@/helpers'
import { scale } from 'react-native-size-matters';
import SendTransaction from '@/components/transaction/SendTransaction';
import { useDispatch } from 'react-redux';
import { transactionActions } from '@/redux/slices/transactionSlice';
import CreateTransaction from '@/components/transaction/CreateTransaction';
import KeyNumberPad from '@/components/global/KeyNumberPad';
import BottomSheet from '@/components/global/BottomSheet';
import PagerView from 'react-native-pager-view';
import SingleTransaction from '@/components/transaction/SingleTransaction';
import TranferRequestDetails from '@/components/transaction/TranferRequestDetails';
import { router } from 'expo-router';
import SingleSentTransaction from '@/components/transaction/SingleSentTransaction';
import { pendingClock } from '@/assets';
import { fetchAllTransactions, fetchRecentTransactions } from '@/redux/fetchHelper';

const { height } = Dimensions.get('window')

const Request: React.FC = () => {
    const dispatch = useDispatch()
    const ref = useRef<PagerView>(null);
    const [searchUser] = useLazyQuery(UserApolloQueries.searchUser())
    const [getSugestedUsers] = useLazyQuery(UserApolloQueries.sugestedUsers())
    const [input, setInput] = useState<string>("0");
    const [openRequest, setOpenRequest] = useState<boolean>(false);
    const [currentPage, setCurrentPage] = useState<number>(0);


    const [users, setUsers] = useState<z.infer<typeof UserAuthSchema.searchUserData>>([])
    const [sugestedUsers, setSugestedUsers] = useState<z.infer<typeof UserAuthSchema.searchUserData>>([])


    const fetchSugestedUsers = async () => {
        const sugestedUsers = await getSugestedUsers()
        const _users = await UserAuthSchema.searchUserData.parseAsync(sugestedUsers.data.sugestedUsers)
        setUsers(_users)
        setSugestedUsers(_users)
    }


    const handleSearch = async (value: string) => {
        try {
            if (value === "") {
                setUsers(sugestedUsers)

            } else {
                const { data } = await searchUser({
                    variables: {
                        "limit": 5,
                        "search": {
                            "username": value,
                            "fullName": value,
                            "email": value,
                            "dniNumber": value
                        }
                    }
                })

                setUsers(data.searchUsers.length > 0 ? data.searchUsers : [])
            }

        } catch (error) {
            console.log(error)
        }
    }


    const onSelectUser = async (user: z.infer<typeof UserAuthSchema.singleSearchUserData>) => {
        await dispatch(transactionActions.setReceiver(user))
        setOpenRequest(true)
    }

    const onCloseFinish = async () => {
        setOpenRequest(false)

        await dispatch(transactionActions.setReceiver({}))
        setInput("0")

        if (currentPage === 2) {
            router.dismissAll()
            router.navigate("(home)")

            ref.current?.setPage(0)
            setCurrentPage(0)
            await dispatch(fetchRecentTransactions())
        }
    }

    const nextPage = () => {
        ref.current?.setPage(currentPage + 1)
        setCurrentPage(currentPage + 1)
    }

    const prevPage = () => {
        if (currentPage === 0) {
            ref.current?.setPage(1)
            setCurrentPage(1)
        } else
            ref.current?.setPage(currentPage - 1)

        setCurrentPage(currentPage - 1)
    }

    useEffect(() => {
        fetchSugestedUsers()
    }, [])

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <SafeAreaView style={{ flex: 1, backgroundColor: colors.darkGray }}>
                <VStack px={"20px"} pt={"20px"}>
                    <VStack w={"100%"} alignItems={"center"}>
                        <Input h={"50px"} w={"100%"} placeholder='Buscar...' onChangeText={(text) => handleSearch(text.toLowerCase())} bColor={colors.lightGray} />
                    </VStack>
                    <Heading mt={"40px"} size={"lg"} color={"white"}>Recomendados</Heading>
                    <FlatList
                        h={"100%"}
                        mt={"10px"}
                        data={users}
                        renderItem={({ item, index }) => (
                            <TouchableOpacity key={`search_user_${index}-${item.username}`} onPress={() => onSelectUser(item)}>
                                <HStack alignItems={"center"} my={"10px"} borderRadius={10}>
                                    {item.profileImageUrl ?
                                        <Image borderRadius={100} resizeMode='contain' alt='logo-image' w={"50px"} h={"50px"} source={{ uri: item.profileImageUrl }} />
                                        :
                                        <DefaultIcon
                                            value={item.fullName}
                                            contentContainerStyle={[styles.contentContainerStyle, { backgroundColor: GENERATE_RAMDOM_COLOR_BASE_ON_TEXT(item.fullName) }]}
                                            textStyle={styles.textStyle}
                                        />
                                    }
                                    <VStack ml={"10px"} justifyContent={"center"}>
                                        <Heading textTransform={"capitalize"} fontSize={scale(15)} color={"white"}>{MAKE_FULL_NAME_SHORTEN(item.fullName)}</Heading>
                                        <Text color={colors.lightSkyGray}>{item.username}</Text>
                                    </VStack>
                                </HStack>
                            </TouchableOpacity>
                        )}
                    />
                    <BottomSheet height={height * 0.9} open={openRequest} onCloseFinish={onCloseFinish}>
                        <PagerView style={{ flex: 1 }} ref={ref} initialPage={currentPage}>
                            <HStack h={"95%"}>
                                <CreateTransaction nextPage={nextPage} title='Solicitar' showBalance={false} setInput={setInput} input={input} />
                            </HStack>
                            <TranferRequestDetails goBack={prevPage} goNext={nextPage} />
                            <SingleSentTransaction key={"single-request-transaction-2"} iconImage={pendingClock} />
                        </PagerView>
                    </BottomSheet>
                </VStack>
            </SafeAreaView>
        </TouchableWithoutFeedback>
    )
}

export default Request


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