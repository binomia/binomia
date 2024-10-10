import React, { useCallback, useEffect, useState } from 'react'
import colors from '@/colors'
import Input from '@/components/global/Input'
import DefaultIcon from 'react-native-default-icon';
import { StyleSheet, SafeAreaView, Keyboard, Dimensions, TouchableWithoutFeedback, TouchableOpacity, RefreshControl } from 'react-native'
import { Heading, Image, Text, VStack, FlatList, HStack, Pressable, ScrollView } from 'native-base'
import { useLazyQuery } from '@apollo/client'
import { UserApolloQueries } from '@/apollo/query'
import { UserAuthSchema } from '@/auth/userAuth'
import { z } from 'zod'
import { FORMAT_CURRENCY, FORMAT_DATE, GENERATE_RAMDOM_COLOR_BASE_ON_TEXT, MAKE_FULL_NAME_SHORTEN } from '@/helpers'
import { useSqlite } from '@/hooks/useSqlite';
import { scale } from 'react-native-size-matters';
import BottomSheet from '@/components/global/BottomSheet';
import { useDispatch, useSelector } from 'react-redux';
import moment from 'moment';
import AntDesign from '@expo/vector-icons/AntDesign';
import { useNavigation } from '@react-navigation/native';
import SingleTransactionScreen from './SingleTransactionScreen';
import SendTransaction from '@/components/transaction/SendTransaction';
import { transactionActions } from '@/redux/slices/transactionSlice';
import { TransactionApolloQueries } from '@/apollo/query/transactionQuery';
import { noTransactions } from '@/assets';

const { height } = Dimensions.get('window')
const TransactionsScreen: React.FC = () => {
	const dispatch = useDispatch()
	const { user } = useSelector((state: any) => state.globalReducer)
	const navigation = useNavigation<any>();

	const [searchUser] = useLazyQuery(UserApolloQueries.searchUser())
	const [accountTransactions] = useLazyQuery(TransactionApolloQueries.accountTransactions())
	const { getSearchedUsers, insertSearchedUser } = useSqlite()

	const [refreshing, setRefreshing] = useState(false);
	const [users, setUsers] = useState<z.infer<typeof UserAuthSchema.searchUserData>>([])
	const [transactions, setTransactions] = useState<any[]>([])
	const [showSingleTransaction, setShowSingleTransaction] = useState<boolean>(false);
	const [showSendTransaction, setShowSendTransaction] = useState<boolean>(false);


	const handleSearch = async (value: string) => {
		try {
			if (value === "") {
				await fetchSearchedUser()

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

	const fetchSearchedUser = async () => {
		const searchedUsers = await getSearchedUsers()
		setUsers(searchedUsers)
	}

	const fetchAccountTransactions = async () => {
		try {
			const { data } = await accountTransactions({
				variables: {
					"page": 1,
					"pageSize": 2,
					"accountId": 1
				}
			})

			setTransactions(data.accountTransactions)
			data.accountTransactions.forEach(async (transaction: any) => {
				const userFromData: z.infer<typeof UserAuthSchema.singleSearchUserData> = {
					id: transaction.from.user.id,
					dniNumber: transaction.from.user.dniNumber,
					fullName: transaction.from.user.fullName,
					profileImageUrl: transaction.from.user.profileImageUrl,
					username: transaction.from.user.username,
					email: transaction.from.user.email,
					status: transaction.from.user.status
				}
				const userToData: z.infer<typeof UserAuthSchema.singleSearchUserData> = {
					id: transaction.to.user.id,
					dniNumber: transaction.to.user.dniNumber,
					fullName: transaction.to.user.fullName,
					profileImageUrl: transaction.to.user.profileImageUrl,
					username: transaction.to.user.username,
					email: transaction.to.user.email,
					status: transaction.to.user.status
				}

				await insertSearchedUser(userToData)
				await insertSearchedUser(userFromData)
			})

		} catch (error) {
			console.error(error)
		}
	}

	const onSelectUser = async (user: z.infer<typeof UserAuthSchema.singleSearchUserData>) => {
		await dispatch(transactionActions.setReceiver(user))
		setShowSendTransaction(true)
	}

	const onSelectTransaction = async (transaction: any) => {
		await dispatch(transactionActions.setTransaction({
			id: transaction.id,
			fullName: formatTransaction(transaction).fullName,
			profileImageUrl: formatTransaction(transaction).profileImageUrl,
			username: formatTransaction(transaction).username,
			isFromMe: formatTransaction(transaction).isFromMe,
			amount: transaction.amount,
			createdAt: transaction.createdAt
		}))
		setShowSingleTransaction(true)
	}

	const onCloseFinish = () => {
		setShowSingleTransaction(false)
	}

	const formatTransaction = (transaction: any) => {
		const isFromMe = transaction.from.user.id === user.id
		const data = {
			isFromMe,
			profileImageUrl: isFromMe ? user.profileImageUrl : transaction.to.user.profileImageUrl,
			amount: transaction.amount,
			fullName: isFromMe ? user.fullName : transaction.from.user.fullName,
			username: isFromMe ? user.username : transaction.from.user.username
		}

		return data
	}

	const onRefresh = useCallback(async () => {
		setRefreshing(true);

		await accountTransactions()
		setTimeout(() => {
			setRefreshing(false);
		}, 2000);
	}, []);


	useEffect(() => {
		fetchSearchedUser()
		fetchAccountTransactions()
	}, [])

	return (
		<TouchableWithoutFeedback onPress={Keyboard.dismiss}>
			<SafeAreaView style={{ flex: 1, backgroundColor: colors.darkGray }}>

				<VStack pt={"20px"}>
					<VStack>
						<VStack px={"20px"} w={"100%"} alignItems={"center"}>
							<Input h={"50px"} w={"100%"} placeholder='Buscar...' onChangeText={(value) => handleSearch(value.toLowerCase())} />
						</VStack>
						<ScrollView px={"20px"} horizontal={true} contentContainerStyle={styles.ScrollView} >
							<VStack mr={"20px"} width={"70px"} height={"70px"} justifyContent={"center"} alignItems={"center"}>
								<Pressable _pressed={{ opacity: 0.5 }} bg={colors.lightGray} borderRadius={100} width={"70px"} height={"70px"} alignItems={"center"} justifyContent={"center"} onPress={() => navigation.navigate("SearchUserScreen")}>
									<AntDesign name="pluscircle" size={24} color="white" />
								</Pressable>
								<Heading mt={"5px"} textTransform={"capitalize"} fontSize={scale(10)} color={"white"}>Nueva</Heading>
							</VStack>
							<FlatList
								scrollEnabled={false}
								showsVerticalScrollIndicator={true}
								data={users}
								contentContainerStyle={{ flexDirection: "row", gap: 20, }}
								renderItem={({ item, index }) => (
									<Pressable _pressed={{ opacity: 0.5 }} borderRadius={100} alignItems={"center"} key={`search_user_${index}-${item.username}`} onPress={() => onSelectUser(item)}>
										<VStack alignItems={"center"} borderRadius={10}>
											{item.profileImageUrl ?
												<Image borderRadius={100} resizeMode='contain' alt='logo-image' w={"50px"} h={"50px"} source={{ uri: item.profileImageUrl }} />
												:
												<DefaultIcon
													value={item.fullName}
													contentContainerStyle={[styles.contentContainerStyle, { width: 70, height: 70, backgroundColor: GENERATE_RAMDOM_COLOR_BASE_ON_TEXT(item.fullName) }]}
													textStyle={styles.textStyle}
												/>
											}
											<VStack mt={"5px"} justifyContent={"center"}>
												<Heading textTransform={"capitalize"} fontSize={scale(10)} color={"white"}>{item.fullName.slice(0, 7)}...</Heading>
											</VStack>
										</VStack>
									</Pressable>

								)}
							/>
						</ScrollView>
					</VStack>
					{transactions.length > 0 ?
						<VStack w={"100%"} h={"auto"}>
							<Heading px={"20px"} fontSize={scale(20)} color={"white"}>Transacciones</Heading>
							<ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />} >
								<FlatList
									px={"20px"}
									h={"100%"}
									mt={"10px"}
									scrollEnabled={false}
									data={transactions}

									renderItem={({ item, index }) => (
										<TouchableOpacity key={`search_user_${index}-${item.transactionId}`} onPress={() => onSelectTransaction(item)}>
											<HStack alignItems={"center"} justifyContent={"space-between"} my={"10px"} borderRadius={10}>
												<HStack>
													{formatTransaction(item).profileImageUrl ?
														<Image borderRadius={100} resizeMode='contain' alt='logo-image' w={"50px"} h={"50px"} source={{ uri: formatTransaction(item).profileImageUrl }} />
														:
														<DefaultIcon
															value={formatTransaction(item).fullName}
															contentContainerStyle={[styles.contentContainerStyle, { backgroundColor: GENERATE_RAMDOM_COLOR_BASE_ON_TEXT(formatTransaction(item).fullName || "") }]}
															textStyle={styles.textStyle}
														/>
													}
													<VStack ml={"10px"} justifyContent={"center"}>
														<Heading textTransform={"capitalize"} fontSize={scale(15)} color={"white"}>{MAKE_FULL_NAME_SHORTEN(formatTransaction(item).fullName || "")}</Heading>
														<Text color={colors.lightSkyGray}>{moment(Number(item.createdAt)).format("lll")}</Text>
													</VStack>
												</HStack>
												<VStack ml={"10px"} justifyContent={"center"}>
													<Heading fontWeight={"semibold"} textTransform={"capitalize"} fontSize={scale(14)} color={formatTransaction(item).isFromMe ? "red" : "mainGreen"}>{formatTransaction(item).isFromMe ? "-" : "+"}{FORMAT_CURRENCY(formatTransaction(item).amount)}</Heading>
												</VStack>
											</HStack>
										</TouchableOpacity>
									)}
								/>
							</ScrollView>
						</VStack>
						: (
							<VStack w={"100%"} h={"50%"} mt={"20px"} px={"20px"} justifyContent={"flex-end"} alignItems={"center"}>
								<Image resizeMode='contain' alt='logo-image' w={"100%"} h={"100%"} source={noTransactions} />
								<VStack justifyContent={"center"} alignItems={"center"}>
									<Heading textTransform={"capitalize"} fontSize={scale(20)} color={"white"}>No hay transacciones</Heading>
									<Text fontSize={scale(14)} color={"white"}>Todavía no hay transacciones para mostrar</Text>
								</VStack>
							</VStack>
						)}
					<BottomSheet openTime={300} height={height} onCloseFinish={onCloseFinish} open={showSingleTransaction}>
						<SingleTransactionScreen onClose={onCloseFinish} />
					</BottomSheet>
					<SendTransaction open={showSendTransaction} onCloseFinish={onCloseFinish} onSendFinish={() => {

					}} />
				</VStack>
			</SafeAreaView>
		</TouchableWithoutFeedback >
	)
}

export default TransactionsScreen


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
	},
	ScrollView: {
		flexDirection: "row",
		alignItems: "center",
		// height: 100,
		marginTop: 15,
		marginBottom: 40
	}
}) 