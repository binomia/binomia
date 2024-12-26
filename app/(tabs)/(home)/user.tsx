import React, { useEffect, useState } from 'react'
import colors from '@/colors'
import Input from '@/components/global/Input'
import DefaultIcon from 'react-native-default-icon';
import { StyleSheet, SafeAreaView, Keyboard, TouchableWithoutFeedback, TouchableOpacity } from 'react-native'
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


const SearchUserScreen: React.FC = () => {
    const dispatch = useDispatch()
    const [searchUser] = useLazyQuery(UserApolloQueries.searchUser())
    const [getSugestedUsers] = useLazyQuery(UserApolloQueries.sugestedUsers())

    const [users, setUsers] = useState<z.infer<typeof UserAuthSchema.searchUserData>>([])
    const [sugestedUsers, setSugestedUsers] = useState<z.infer<typeof UserAuthSchema.searchUserData>>([])
    const [showSendTransaction, setShowSendTransaction] = useState<boolean>(false);


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

                setUsers(data.searchUsers)
            }

        } catch (error) {
            console.log(error)
        }
    }


    const onSelectUser = async (user: z.infer<typeof UserAuthSchema.singleSearchUserData>) => {
        await dispatch(transactionActions.setReceiver(user))
        setShowSendTransaction(true)
    }

    useEffect(() => {
        fetchSugestedUsers()
    }, [])

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <SafeAreaView style={{ flex: 1, backgroundColor: colors.darkGray }}>
                <VStack px={"20px"} pt={"20px"}>
                    <VStack w={"100%"} alignItems={"center"}>
                        <Input h={"50px"} w={"100%"} placeholder='Buscar...' onChangeText={(value) => handleSearch(value.toLowerCase())} bColor={colors.lightGray} />
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
                    <SendTransaction open={showSendTransaction} onCloseFinish={() => setShowSendTransaction(false)} onSendFinish={() => setShowSendTransaction(false)} />
                </VStack>
            </SafeAreaView>
        </TouchableWithoutFeedback>
    )
}

export default SearchUserScreen


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