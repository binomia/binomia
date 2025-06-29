import React, { useEffect, useRef, useState } from 'react'
import colors from '@/colors'
import Input from '@/components/global/Input'
import CreateTransaction from '@/components/transaction/CreateTransaction';
import BottomSheet from '@/components/global/BottomSheet';
import PagerView from 'react-native-pager-view';
import TranferRequestDetails from '@/components/transaction/TranferRequestDetails';
import SingleSentTransaction from '@/components/transaction/SingleSentTransaction';
import { SafeAreaView, Keyboard, TouchableWithoutFeedback, TouchableOpacity, Dimensions, Alert } from 'react-native'
import { Heading, Image, Text, VStack, FlatList, HStack, Avatar } from 'native-base'
import { useLazyQuery } from '@apollo/client'
import { UserApolloQueries } from '@/apollo/query'
import { UserAuthSchema } from '@/auth/userAuth'
import { z } from 'zod'
import { EXTRACT_FIRST_LAST_INITIALS, GENERATE_RAMDOM_COLOR_BASE_ON_TEXT, MAKE_FULL_NAME_SHORTEN } from '@/helpers'
import { scale } from 'react-native-size-matters';
import { useDispatch, useSelector } from 'react-redux';
import { transactionActions } from '@/redux/slices/transactionSlice';
import { router } from 'expo-router';
import { pendingClock } from '@/assets';
import { fetchRecentTransactions } from '@/redux/fetchHelper';

const { height } = Dimensions.get('window')

const Request: React.FC = () => {
    const dispatch = useDispatch()
    const ref = useRef<PagerView>(null);
    const { receiver } = useSelector((state: any) => state.transactionReducer)
    const [fetchSingleUser] = useLazyQuery(UserApolloQueries.singleUser())

    const [searchUser] = useLazyQuery(UserApolloQueries.searchUser())
    const [getSugestedUsers] = useLazyQuery(UserApolloQueries.sugestedUsers())

    const [input, setInput] = useState<string>("0");
    const [openRequest, setOpenRequest] = useState<boolean>(false);
    const [currentPage, setCurrentPage] = useState<number>(0);
    const [users, setUsers] = useState<z.infer<typeof UserAuthSchema.searchUserData>>([])


    const fetchSugestedUsers = async () => {
        const sugestedUsers = await getSugestedUsers({ variables: { allowRequestMe: true } })
        const _users = await UserAuthSchema.searchUserData.parseAsync(sugestedUsers.data.sugestedUsers)
        setUsers(_users)
    }

    const handleSearch = async (value: string) => {
        try {
            if (value === "") {
                await fetchSugestedUsers()

            } else {
                const { data } = await searchUser({
                    variables: {
                        "allowRequestMe": true,
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

    // const onCloseFinishFromDetails = async () => {
    //     await onCloseFinish()
    //     await dispatch(transactionActions.setTransactionDetails({}))
    //     await fetchSugestedUsers()

    //     ref.current?.setPage(0)
    // }

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

    const onPageSelected = async () => {
        const { data } = await fetchSingleUser({
            variables: {
                username: receiver.username
            }
        })

        const { status, allowRequestMe } = data.singleUser.account
        if (!allowRequestMe) {
            Alert.alert("Advertencia", `${receiver.fullName} no puede recibir dinero en este momento.`, [{
                onPress: async () => {
                    setCurrentPage(0)
                    ref.current?.setPage(0)

                    await onCloseFinish()
                    await dispatch(transactionActions.setTransactionDetails({}))
                    await fetchSugestedUsers()
                }
            }])

            throw new Error(`${receiver.fullName} no puede recibir dinero en este momento.`)
        }

        if (status !== "active") {
            Alert.alert("Advertencia", `${receiver.fullName}  no se encuentra activo.`, [{
                onPress: async () => {
                    await onCloseFinish()
                    await dispatch(transactionActions.setTransactionDetails({}))
                    await fetchSugestedUsers()

                    ref.current?.setPage(0)
                }
            }])

            throw new Error(`${receiver.fullName}  no se encuentra activo.`)
        }

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
                                        <Avatar borderRadius={100} w={"50px"} h={"50px"} bg={GENERATE_RAMDOM_COLOR_BASE_ON_TEXT(item.fullName || "")}>
                                            <Heading size={"sm"} color={colors.white}>
                                                {EXTRACT_FIRST_LAST_INITIALS(item.fullName || "0")}
                                            </Heading>
                                        </Avatar>
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
                        <PagerView style={{ flex: 1 }} scrollEnabled={false} onPageSelected={onPageSelected} ref={ref} initialPage={currentPage}>
                            <HStack h={"95%"}>
                                <CreateTransaction nextPage={nextPage} title='Solicitar' showBalance={false} setInput={setInput} input={input} />
                            </HStack>
                            <TranferRequestDetails goBack={prevPage} onCloseFinish={onCloseFinish} goNext={nextPage} />
                            <SingleSentTransaction key={"single-request-transaction-2"} iconImage={pendingClock} />
                        </PagerView>
                    </BottomSheet>
                </VStack>
            </SafeAreaView>
        </TouchableWithoutFeedback>
    )
}

export default Request
