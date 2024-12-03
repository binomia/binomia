import React, { useCallback, useEffect, useState, useRef } from 'react'
import colors from '@/colors'
import Input from '@/components/global/Input'
import DefaultIcon from 'react-native-default-icon';
import { StyleSheet, Keyboard, Dimensions, TouchableWithoutFeedback, TouchableOpacity, RefreshControl, NativeSyntheticEvent, NativeScrollEvent } from 'react-native'
import { Heading, Image, Text, VStack, FlatList, HStack, Spinner, Pressable, ScrollView } from 'native-base'
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
import { cancelIcon, checked, noTransactions, pendingClock } from '@/assets';
import { TransactionAuthSchema } from '@/auth/transactionAuth';
import { router, useNavigation } from 'expo-router';
import TransactionSkeleton from '@/components/transaction/transactionSkeleton';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SocketContext } from '@/contexts/socketContext';
import { SOCKET_EVENTS } from '@/constants';
import { globalActions } from '@/redux/slices/globalSlice';
import { generate as uuid } from "short-uuid"
import Button from '@/components/global/Button';
import PagerView from 'react-native-pager-view';
import SingleSentTransaction from '@/components/transaction/SingleSentTransaction';


const { height } = Dimensions.get('window')
const TransactionsScreen: React.FC = () => {
	const ref = useRef<PagerView>(null);
	const dispatch = useDispatch()
	const { user } = useSelector((state: any) => state.globalReducer)
	const { hasNewTransaction } = useSelector((state: any) => state.transactionReducer)
	const isFocused = useNavigation().isFocused()

	const [searchUser] = useLazyQuery(UserApolloQueries.searchUser())
	const [accountTransactions, { refetch: refetchAccountTransactions }] = useLazyQuery(TransactionApolloQueries.accountTransactions())
	const [getSugestedUsers] = useLazyQuery(UserApolloQueries.sugestedUsers())

	const [singleTransactionTitle, setSingleTransactionTitle] = useState<string>("Ver Detalles");
	const [refreshing, setRefreshing] = useState(false);
	const [users, setUsers] = useState<z.infer<typeof UserAuthSchema.searchUserData>>([])
	const [transactions, setTransactions] = useState<any[]>([])
	const [showSingleTransaction, setShowSingleTransaction] = useState<boolean>(false);
	const [showSendTransaction, setShowSendTransaction] = useState<boolean>(false);
	const [isLoading, setIsLoading] = useState<boolean>(true);
	const [needRefresh, setNeedRefresh] = useState<boolean>(false);
	const [showPayButton, setShowPayButton] = useState<boolean>(false);
	const [page, setPage] = useState<number>(0);
	const [isBottom, setIsBottom] = useState(false);
	const [isLoadingMore, setIsLoadingMore] = useState(false);

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

	const fetchAccountTransactions = async (page: number = 1, pageSize: number = 20) => {
		try {
			const { data } = await accountTransactions({
				variables: {
					"page": page,
					"pageSize": pageSize
				}
			})

			setTransactions(data.accountTransactions)
			setIsLoading(false)

		} catch (error) {
			console.error(error)
		}
	}

	const onSelectUser = async (user: z.infer<typeof UserAuthSchema.singleSearchUserData>) => {
		await dispatch(transactionActions.setReceiver(user))
		setShowSendTransaction(true)
	}

	const onSelectTransaction = async (transaction: any) => {
		console.log(transaction);


		await dispatch(transactionActions.setTransaction(Object.assign({}, transaction, { ...formatTransaction(transaction) })))

		setShowPayButton(formatTransaction(transaction).showPayButton)
		setShowSingleTransaction(true)
		setSingleTransactionTitle(formatTransaction(transaction).showPayButton ? "Pagar" : "Ver Detalles")

		// router.push("/transaction")
	}

	const onCloseFinishSingleTransaction = async () => {
		setShowSingleTransaction(false)

		if (needRefresh)
			await onRefresh()

		setNeedRefresh(false)
	}

	const onSendCloseFinish = () => {
		setShowSendTransaction(false)
	}

	const formatTransaction = (transaction: any) => {
		// const transaction = TransactionAuthSchema.singleTransaction.parse(_transaction)
		const isFromMe = transaction.from.user?.id === user.id


		const profileImageUrl = isFromMe ? transaction.to.user?.profileImageUrl : transaction.from.user?.profileImageUrl
		const fullName = isFromMe ? transaction.to.user?.fullName : transaction.from.user?.fullName
		const username = isFromMe ? transaction.from.user?.username : transaction.to.user?.username
		const showPayButton = transaction.transactionType === "request" && !isFromMe && transaction.status === "pending"
		const amountColor = (transaction.transactionType === "request" && isFromMe || transaction.transactionType === "transfer" && !isFromMe) ? colors.mainGreen : colors.red
		const showMap = (transaction.transactionType === "request" && isFromMe || transaction.transactionType === "transfer" && !isFromMe) ? false : true

		return {
			isFromMe,
			showMap,
			amountColor,
			profileImageUrl: profileImageUrl || "",
			amount: transaction.amount,
			showPayButton,
			fullName: fullName || "",
			username: username || ""
		}
	}

	const onRefresh = useCallback(async () => {
		setRefreshing(true);
		await fetchAccountTransactions()
		setRefreshing(false);
	}, []);

	const goNext = (next: number = 1) => {
		setShowPayButton(false)
		setNeedRefresh(true)
		ref.current?.setPage(next)
	}

	const onScroll = ({ nativeEvent }: NativeSyntheticEvent<NativeScrollEvent>) => {
		const { contentOffset, layoutMeasurement, contentSize } = nativeEvent;
		const isAtBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - 20; // Adjust the threshold as needed

		setIsBottom(isAtBottom);
	}


	useEffect(() => {
		(async () => {
			if (hasNewTransaction) {
				await fetchAccountTransactions()
				await dispatch(transactionActions.setHasNewTransaction(false))
			}

		})()

	}, [isFocused, hasNewTransaction])

	useEffect(() => {
		setIsLoading(true)
		fetchSearchedUser()
		fetchAccountTransactions()
	}, [])

	useEffect(() => {
		(async () => {
			if (isBottom) {
				try {
					setIsLoadingMore(true)

					const { data } = await refetchAccountTransactions({ page: page + 1, pageSize: 20 })

					if (data.accountTransactions.length > 0) {
						setPage(page + 1)
						setTransactions([...transactions, ...data.accountTransactions])
					}
					







					
					setIsLoadingMore(false)
					
				} catch (error) {
					console.log(error);
				}
			}
		})()

	}, [isBottom])

	return (
		isLoading ? <TransactionSkeleton /> : (
			<VStack flex={1} pt={"20px"} bg={colors.darkGray}>
				<VStack px={"20px"} w={"100%"} alignItems={"center"}>
					<TouchableWithoutFeedback onPress={Keyboard.dismiss}>
						<Input h={"50px"} w={"100%"} placeholder='Buscar...' onChangeText={(value) => handleSearch(value.toLowerCase())} />
					</TouchableWithoutFeedback >
				</VStack>
				<ScrollView onScroll={onScroll} flex={1} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 80 }}>
					<HStack px={"20px"} style={styles.ScrollView} >
						<FlatList
							h={"100%"}
							showsVerticalScrollIndicator={false}
							horizontal={true}
							data={[users[0], ...users]}
							contentContainerStyle={{ flexDirection: "row", gap: 20, justifyContent: "center", alignItems: "center" }}
							renderItem={({ item, index }) => (
								index === 0 ? (
									<VStack key={Date.now()} justifyContent={"center"} alignItems={"center"}>
										<Pressable _pressed={{ opacity: 0.5 }} bg={colors.lightGray} borderRadius={100} w={scale(55)} h={scale(55)} alignItems={"center"} justifyContent={"center"} onPress={() => router.navigate("/user")}>
											<AntDesign name="pluscircle" size={30} color="white" />
										</Pressable>
										<Heading mt={"5px"} textTransform={"capitalize"} fontSize={scale(12)} color={"white"}>Nueva</Heading>
									</VStack>
								) : (
									<Pressable _pressed={{ opacity: 0.5 }} borderRadius={100} alignItems={"center"} key={`search_user_${index}-${Date.now()}}`} onPress={() => onSelectUser(item)}>
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
					{transactions.length > 0 ?
						<VStack w={"100%"} >
							<Heading px={"20px"} fontSize={scale(20)} color={"white"}>Transacciones</Heading>
							<FlatList
								px={"20px"}
								scrollEnabled={false}
								mt={"10px"}
								data={transactions}
								renderItem={({ item, index }: any) => (
									<TouchableOpacity key={`search_user_${index}-${Date.now()}}`} onPress={() => onSelectTransaction(item)}>
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
													<Heading textTransform={"capitalize"} fontSize={scale(13)} color={"white"}>{MAKE_FULL_NAME_SHORTEN(formatTransaction(item).fullName || "")}</Heading>
													<Text fontSize={scale(10)} color={colors.lightSkyGray}>{moment(Number(item.createdAt)).format("lll")}</Text>
												</VStack>
											</HStack>
											<VStack ml={"10px"} justifyContent={"center"}>
												{formatTransaction(item).showPayButton ?
													<HStack space={1} w={"120px"} h={"40px"} bg={colors.mainGreen} borderRadius={25} color='white' justifyContent={"center"} alignItems={"center"}>
														<Heading textTransform={"capitalize"} fontSize={scale(13)} color={"white"}>Pagar</Heading>
														<Text fontWeight={"semibold"} fontSize={scale(10)} color={colors.white}>{FORMAT_CURRENCY(formatTransaction(item).amount)}</Text>
													</HStack>
													:
													<Heading fontWeight={"semibold"} textTransform={"capitalize"} fontSize={scale(13)} color={formatTransaction(item).amountColor}>{FORMAT_CURRENCY(formatTransaction(item).amount)}</Heading>
												}
											</VStack>
										</HStack>
									</TouchableOpacity>
								)}
							/>

						</VStack>
						: (
							<VStack mt={"20px"} key={`transations-screen-no-transactions-${Date.now()}`} w={"100%"} h={height / 3} px={"20px"} justifyContent={"flex-end"} alignItems={"center"}>
								<Image resizeMode='contain' alt='logo-image' w={"100%"} h={"100%"} source={noTransactions} />
								<VStack justifyContent={"center"} alignItems={"center"}>
									<Heading textTransform={"capitalize"} fontSize={scale(20)} color={"white"}>No hay transacciones</Heading>
									<Text fontSize={scale(14)} color={"white"}>Todavía no hay transacciones para mostrar</Text>
								</VStack>
							</VStack>
						)
					}
					{isLoadingMore ? <Spinner mt={"10px"} size={"lg"} /> : null}
				</ScrollView>
				<BottomSheet height={height * 0.9} onCloseFinish={onCloseFinishSingleTransaction} open={showSingleTransaction}>
					<SingleSentTransaction iconImage={pendingClock} showPayButton={showPayButton} goNext={goNext} title={singleTransactionTitle} />
					{/* <SingleTransactionScreen showPayButton={showPayButton} goNext={goNext} title={singleTransactionTitle} /> */}
					{/* <PagerView initialPage={initialPage} scrollEnabled={false} style={{ flex: 1 }} ref={ref}>
						<SingleSentTransaction iconImage={pendingClock} showPayButton={showPayButton} goNext={goNext} title={singleTransactionTitle} />
						<SingleTransactionScreen iconImage={checked} />
						<SingleTransactionScreen iconImage={cancelIcon} />
						<SingleTransactionScreen iconImage={pendingClock} />
					</PagerView> */}
				</BottomSheet>
				<SendTransaction open={showSendTransaction} onCloseFinish={onSendCloseFinish} onSendFinish={onSendCloseFinish} />
			</VStack>
		)
	)
}

export default TransactionsScreen

const styles = StyleSheet.create({
	contentContainerStyle: {
		width: 50,
		height: 50,
		borderRadius: 100
	},
	textStyle: {
		fontSize: 20,
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