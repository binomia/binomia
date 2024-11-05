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
import { FORMAT_CURRENCY, FORMAT_FULL_NAME, GENERATE_RAMDOM_COLOR_BASE_ON_TEXT, MAKE_FULL_NAME_SHORTEN } from '@/helpers'
import { scale } from 'react-native-size-matters';
import BottomSheet from '@/components/global/BottomSheet';
import { useDispatch, useSelector } from 'react-redux';
import moment from 'moment';
import AntDesign from '@expo/vector-icons/AntDesign';
import SingleTransactionScreen from '@/components/transaction/SingleTransaction';
import SendTransaction from '@/components/transaction/SendTransaction';
import { transactionActions } from '@/redux/slices/transactionSlice';
import { TransactionApolloQueries } from '@/apollo/query/transactionQuery';
import { noTransactions } from '@/assets';
import { TransactionAuthSchema } from '@/auth/transactionAuth';
import { router } from 'expo-router';

const { height } = Dimensions.get('window')
const TransactionsScreen: React.FC = () => {
	const dispatch = useDispatch()
	const { user, account } = useSelector((state: any) => state.globalReducer)

	const [searchUser] = useLazyQuery(UserApolloQueries.searchUser())
	const [accountTransactions] = useLazyQuery(TransactionApolloQueries.accountTransactions())
	const [getSugestedUsers] = useLazyQuery(UserApolloQueries.sugestedUsers())

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
		const sugestedUsers = await getSugestedUsers()
		const _users = await UserAuthSchema.searchUserData.parseAsync(sugestedUsers.data.sugestedUsers)
		setUsers(_users)
	}

	const fetchAccountTransactions = async () => {
		try {
			const { data } = await accountTransactions({
				variables: {
					"page": 1,
					"pageSize": 10,
					"accountId": account.id
				}
			})

			console.log(JSON.stringify(data.accountTransactions, null, 2));


			setTransactions(data.accountTransactions)

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

	const onCloseFinishSingleTransaction = () => {
		setShowSingleTransaction(false)
	}

	const onSendCloseFinish = () => {
		setShowSendTransaction(false)
	}

	const formatTransaction = (_transaction: any) => {
		const transaction = TransactionAuthSchema.singleTransaction.parse(_transaction)
		const isFromMe = transaction.from.user?.id === user.id

		const profileImageUrl = isFromMe ? transaction.to.user?.profileImageUrl : transaction.from.user?.profileImageUrl
		const fullName = isFromMe ? transaction.to.user?.fullName : transaction.from.user?.fullName
		const username = isFromMe ? transaction.from.user?.username : transaction.to.user?.username

		return {
			isFromMe,
			profileImageUrl: profileImageUrl || "",
			amount: transaction.amount,
			fullName: fullName || "",
			username: username || ""
		}
	}

	const onRefresh = useCallback(async () => {
		setRefreshing(true);

		await fetchAccountTransactions()
		setTimeout(() => {
			setRefreshing(false);
		}, 1000);
	}, []);


	useEffect(() => {
		fetchSearchedUser()
		fetchAccountTransactions()
	}, [])

	return (
		<TouchableWithoutFeedback onPress={Keyboard.dismiss}>
			<SafeAreaView style={{ flex: 1, backgroundColor: colors.darkGray }}>
				<VStack pt={"20px"}>
					<VStack px={"20px"} w={"100%"} alignItems={"center"}>
						<Input h={"50px"} w={"100%"} placeholder='Buscar...' onChangeText={(value) => handleSearch(value.toLowerCase())} />
					</VStack>
					<ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 80 }}>
						<VStack>
							<HStack px={"20px"} style={styles.ScrollView} >
								<FlatList
									h={"100%"}
									showsVerticalScrollIndicator={false}
									horizontal={true}
									data={[users[0], ...users]}
									contentContainerStyle={{ flexDirection: "row", gap: 20, justifyContent: "center", alignItems: "center" }}
									renderItem={({ item, index }) => (
										index === 0 ? (
											<VStack key={"transations-screen-" + index} justifyContent={"center"} alignItems={"center"}>
												<Pressable _pressed={{ opacity: 0.5 }} bg={colors.lightGray} borderRadius={100} w={scale(55)} h={scale(55)} alignItems={"center"} justifyContent={"center"} onPress={() => router.navigate("/user")}>
													<AntDesign name="pluscircle" size={30} color="white" />
												</Pressable>
												<Heading mt={"5px"} textTransform={"capitalize"} fontSize={scale(12)} color={"white"}>Nueva</Heading>
											</VStack>
										) : (
											<Pressable _pressed={{ opacity: 0.5 }} borderRadius={100} alignItems={"center"} key={`search_user_${index}-${Date.now()}`} onPress={() => onSelectUser(item)}>
												<VStack alignItems={"center"} borderRadius={10}>
													{item.profileImageUrl ?
														<Image borderRadius={100} resizeMode='contain' alt='logo-image' w={scale(55)} h={scale(55)} source={{ uri: item.profileImageUrl }} />
														:
														<DefaultIcon
															value={item.fullName}
															contentContainerStyle={[styles.contentContainerStyle, { width: 70, height: 70, backgroundColor: GENERATE_RAMDOM_COLOR_BASE_ON_TEXT(item.fullName) }]}
															textStyle={styles.textStyle}
														/>
													}
													<VStack mt={"5px"} justifyContent={"center"}>
														<Heading textTransform={"capitalize"} fontSize={scale(12)} color={"white"}>{FORMAT_FULL_NAME(item.fullName)}</Heading>
													</VStack>
												</VStack>
											</Pressable>
										)
									)}
								/>
							</HStack>
						</VStack>
						{transactions.length > 0 ?
							<VStack w={"100%"} >
								<Heading px={"20px"} fontSize={scale(20)} color={"white"}>Transacciones</Heading>
								<FlatList
									px={"20px"}
									scrollEnabled={false}
									mt={"10px"}
									data={transactions}
									renderItem={({ item, index }) => (
										<TouchableOpacity key={`search_user_${index}-${item.transactionId}-${Date.now()}`} onPress={() => onSelectTransaction(item)}>
											<HStack alignItems={"center"} justifyContent={"space-between"} my={"10px"} borderRadius={10}>
												<HStack>
													{formatTransaction(item).profileImageUrl ?
														<Image borderRadius={100} resizeMode='contain' alt='logo-image' w={scale(40)} h={scale(40)} source={{ uri: formatTransaction(item).profileImageUrl }} />
														:
														<DefaultIcon
															value={formatTransaction(item).fullName || ""}
															contentContainerStyle={[styles.contentContainerStyle, { backgroundColor: GENERATE_RAMDOM_COLOR_BASE_ON_TEXT(formatTransaction(item).fullName || "") }]}
															textStyle={styles.textStyle}
														/>
													}
													<VStack ml={"10px"} justifyContent={"center"}>
														<Heading textTransform={"capitalize"} fontSize={scale(16)} color={"white"}>{MAKE_FULL_NAME_SHORTEN(formatTransaction(item).fullName || "")}</Heading>
														<Text fontSize={scale(12)} color={colors.lightSkyGray}>{moment(Number(item.createdAt)).format("lll")}</Text>
													</VStack>
												</HStack>
												<VStack ml={"10px"} justifyContent={"center"}>
													<Heading fontWeight={"semibold"} textTransform={"capitalize"} fontSize={scale(16)} color={formatTransaction(item).isFromMe ? "red" : "mainGreen"}>{formatTransaction(item).isFromMe ? "-" : "+"}{FORMAT_CURRENCY(formatTransaction(item).amount)}</Heading>
												</VStack>
											</HStack>
										</TouchableOpacity>
									)}
								/>
							</VStack>
							: (
								<VStack key={"transations-screen-no-transactions" + Date.now()} w={"100%"} h={"50%"} mt={"20px"} px={"20px"} justifyContent={"flex-end"} alignItems={"center"}>
									<Image resizeMode='contain' alt='logo-image' w={"100%"} h={"100%"} source={noTransactions} />
									<VStack justifyContent={"center"} alignItems={"center"}>
										<Heading textTransform={"capitalize"} fontSize={scale(20)} color={"white"}>No hay transacciones</Heading>
										<Text fontSize={scale(14)} color={"white"}>Todavía no hay transacciones para mostrar</Text>
									</VStack>
								</VStack>
							)
						}
					</ScrollView>
					<BottomSheet showDragIcon={false} draggable={false} openTime={300} height={height} onCloseFinish={onCloseFinishSingleTransaction} open={showSingleTransaction}>
						<SingleTransactionScreen onClose={onCloseFinishSingleTransaction} />
					</BottomSheet>
					<SendTransaction open={showSendTransaction} onCloseFinish={onSendCloseFinish} onSendFinish={onSendCloseFinish} />
				</VStack>
			</SafeAreaView>
		</TouchableWithoutFeedback >
	)
}

export default TransactionsScreen


const styles = StyleSheet.create({
	contentContainerStyle: {
		width: 40,
		height: 40,
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