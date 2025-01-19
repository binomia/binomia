import React, { useCallback, useEffect, useState, useRef } from 'react'
import colors from '@/colors'
import Input from '@/components/global/Input'
import DefaultIcon from 'react-native-default-icon';
import BottomSheet from '@/components/global/BottomSheet';
import moment from 'moment';
import AntDesign from '@expo/vector-icons/AntDesign';
import SendTransaction from '@/components/transaction/SendTransaction';
import TransactionSkeleton from '@/components/transaction/transactionSkeleton';
import PagerView from 'react-native-pager-view';
import SingleSentTransaction from '@/components/transaction/SingleSentTransaction';
import { z } from 'zod'
import { StyleSheet, Keyboard, Dimensions, TouchableWithoutFeedback, RefreshControl, NativeSyntheticEvent, NativeScrollEvent } from 'react-native'
import { Heading, Image, Text, VStack, FlatList, HStack, Spinner, Pressable, ScrollView } from 'native-base'
import { useLazyQuery } from '@apollo/client'
import { UserApolloQueries } from '@/apollo/query'
import { UserAuthSchema } from '@/auth/userAuth'
import { FORMAT_CURRENCY, FORMAT_FULL_NAME, GENERATE_RAMDOM_COLOR_BASE_ON_TEXT, MAKE_FULL_NAME_SHORTEN } from '@/helpers'
import { scale } from 'react-native-size-matters';
import { useDispatch, useSelector } from 'react-redux';
import { transactionActions } from '@/redux/slices/transactionSlice';
import { TransactionApolloQueries } from '@/apollo/query/transactionQuery';
import { noTransactions, pendingClock } from '@/assets';
import { router, useNavigation } from 'expo-router';
import { fetchAllTransactions } from '@/redux/fetchHelper';
import SingleTopTup from '../topups/SingleTopTup';

type Props = {}

const { height, width } = Dimensions.get('window')
const Transactions: React.FC<Props> = ({ }: Props) => {
	const ref = useRef<PagerView>(null);
	const dispatch = useDispatch()
	const { user } = useSelector((state: any) => state.globalReducer)
	const { hasNewTransaction, loading, transactions } = useSelector((state: any) => state.transactionReducer)
	const isFocused = useNavigation().isFocused()

	const [searchAccountTransactions] = useLazyQuery(TransactionApolloQueries.searchAccountTransactions())
	const [getSugestedUsers] = useLazyQuery(UserApolloQueries.sugestedUsers())

	const [singleTransactionTitle, setSingleTransactionTitle] = useState<string>("Ver Detalles");
	const [refreshing, setRefreshing] = useState(false);
	const [users, setUsers] = useState<z.infer<typeof UserAuthSchema.searchUserData>>([])
	const [transaction, setTransaction] = useState<any>({})
	const [filteredTransactions, setFilteredTransactions] = useState<any[]>([])
	const [showSingleTransaction, setShowSingleTransaction] = useState<boolean>(false);
	const [showSendTransaction, setShowSendTransaction] = useState<boolean>(false);
	const [needRefresh, setNeedRefresh] = useState<boolean>(false);
	const [showPayButton, setShowPayButton] = useState<boolean>(false);
	const [page, setPage] = useState<number>(0);
	const [isBottom, setIsBottom] = useState(false);
	const [isLoadingMore, setIsLoadingMore] = useState(false);
	const [openBottomSheet, setOpenBottomSheet] = useState(false);


	const handleSearch = async (value: string) => {
		try {
			if (value === "") {
				setFilteredTransactions(transactions)

			} else {
				const { data } = await searchAccountTransactions({
					variables: {
						"page": 1,
						"pageSize": 10,
						"fullName": value.toLowerCase()
					}
				})

				setFilteredTransactions(data.searchAccountTransactions.length > 0 ? data.searchAccountTransactions : [])
			}

		} catch (error) {
			console.log(error)
		}
	}

	const formatTransaction = (transaction: any) => {
		const { transactionType, status, amount } = transaction
		const isFromMe = transaction.from.user?.id === user.id

		const profileImageUrl = isFromMe ? transaction.to.user?.profileImageUrl : transaction.from.user?.profileImageUrl
		const fullName = isFromMe ? transaction.to.user?.fullName : transaction.from.user?.fullName
		const username = isFromMe ? transaction.from.user?.username : transaction.to.user?.username
		const showPayButton = transaction.transactionType === "request" && !isFromMe && transaction.status === "requested"
		const showMap = (transaction.transactionType === "request" && isFromMe) || (transaction.transactionType === "transfer" && !isFromMe) ? false : true

		let amountColor;

		if ((transactionType === "request" && isFromMe && status === "requested")) {
			amountColor = colors.pureGray

		} else if ((transaction.transactionType === "request" && isFromMe || transaction.transactionType === "transfer" && !isFromMe) && transaction.status !== "cancelled") {
			amountColor = colors.mainGreen

		} else {
			amountColor = colors.red
		}

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

	const fetchSearchedUser = async () => {
		const sugestedUsers = await getSugestedUsers()
		const _users = await UserAuthSchema.searchUserData.parseAsync(sugestedUsers.data.sugestedUsers)
		setUsers(_users)
	}


	const onSelectUser = async (user: z.infer<typeof UserAuthSchema.singleSearchUserData>) => {
		await dispatch(transactionActions.setReceiver(user))
		setShowSendTransaction(true)
	}

	const onSelectTransaction = async (transaction: any) => {
		await dispatch(transactionActions.setTransaction(Object.assign({}, transaction, { ...formatTransaction(transaction) })))

		setShowPayButton(formatTransaction(transaction).showPayButton)
		setShowSingleTransaction(true)
		setSingleTransactionTitle(formatTransaction(transaction).showPayButton ? "Pagar" : "Ver Detalles")
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


	const onRefresh = useCallback(async () => {
		setRefreshing(true);
		// await fetchAccountTransactions()
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

	const onOpenBottomSheet = async (transaction: any) => {
		setTransaction(transaction)
		setOpenBottomSheet(true)
	}

	const onBottomSheetClose = async () => {
		setOpenBottomSheet(false)
		setTransaction({})
	}


	useEffect(() => {
		(async () => {
			if (hasNewTransaction) {
				await dispatch(transactionActions.setHasNewTransaction(false))
			}
		})()

	}, [isFocused, hasNewTransaction])

	useEffect(() => {
		(async () => {
			await fetchSearchedUser()
			await dispatch(fetchAllTransactions({ page: 1, pageSize: 10 }))
		})()
	}, [])

	useEffect(() => {
		(async () => {
			if (isBottom && transactions.length >= 10) {
				try {
					setIsLoadingMore(true)

					const transactionsLength = transactions?.length

					await dispatch(fetchAllTransactions({ page: page + 1, pageSize: 10 }))


					if (transactions.length > transactionsLength) {
						setPage(page + 1)
					}

					setIsLoadingMore(false)

				} catch (error) {
					console.log(error);
				}
			}
		})()

	}, [isBottom])

	useEffect(() => {
		if (transactions.length > 0) {
			setFilteredTransactions(transactions)
		}

	}, [transactions])

	return (
		loading ? <TransactionSkeleton /> : (
			<VStack flex={1} pt={"20px"} bg={colors.darkGray}>
				<VStack px={"20px"} w={"100%"} alignItems={"center"}>
					<TouchableWithoutFeedback onPress={Keyboard.dismiss}>
						<Input h={"50px"} w={"100%"} placeholder='Buscar...' onChangeText={(value) => handleSearch(value.toLowerCase())} />
					</TouchableWithoutFeedback >
				</VStack>
				<ScrollView onScroll={onScroll} flex={1} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />} contentContainerStyle={{ paddingBottom: 80 }}>
					<HStack px={"20px"} style={styles.ScrollView} >
						<ScrollView horizontal>
							<VStack justifyContent={"center"} alignItems={"center"}>
								<Pressable _pressed={{ opacity: 0.5 }} bg={colors.lightGray} borderRadius={100} w={scale(55)} h={scale(55)} alignItems={"center"} justifyContent={"center"} onPress={() => router.navigate("/user")}>
									<AntDesign name="pluscircle" size={30} color="white" />
								</Pressable>
								<Heading mt={"5px"} textTransform={"capitalize"} fontSize={scale(12)} color={"white"}>Nueva</Heading>
							</VStack>
							{users.map((user, index) => (
								<Pressable ml={"10px"} key={`user(htyrhtyjtuj)-${index}-${user.username}`} _pressed={{ opacity: 0.5 }} borderRadius={100} alignItems={"center"} onPress={() => onSelectUser(user)}>
									<VStack alignItems={"center"} borderRadius={10}>
										{user.profileImageUrl ?
											<Image borderRadius={100} resizeMode='contain' alt='logo-image' w={scale(55)} h={scale(55)} source={{ uri: user.profileImageUrl }} />
											:
											<DefaultIcon
												value={user.fullName}
												contentContainerStyle={[styles.contentContainerStyle, { width: 70, height: 70, backgroundColor: GENERATE_RAMDOM_COLOR_BASE_ON_TEXT(user.fullName) }]}
												textStyle={styles.textStyle}
											/>
										}
										<VStack mt={"5px"} justifyContent={"center"}>
											<Heading textTransform={"capitalize"} fontSize={scale(12)} color={"white"}>{FORMAT_FULL_NAME(user.fullName)}</Heading>
										</VStack>
									</VStack>
								</Pressable>
							))}
						</ScrollView>
					</HStack>
					{filteredTransactions.length > 0 ?
						<VStack w={"100%"} >
							<HStack w={"100%"} justifyContent={"space-between"}>
								<Heading px={"20px"} fontSize={scale(18)} color={"white"}>{"Transacciones"}</Heading>
							</HStack>
							<FlatList
								mt={"10px"}
								px={"20px"}
								scrollEnabled={false}
								data={transactions}
								renderItem={({ item: { data, type }, index }: any) => (
									type === "transaction" ? (
										<Pressable bg={colors.lightGray} my={"5px"} borderRadius={10} px={"15px"} py={"10px"} key={`transactions(tgrtgnrhbfhrbgr)-${data?.transactionId}-${index}-${data?.transactionId}`} _pressed={{ opacity: 0.5 }} onPress={() => onSelectTransaction(data)}>
											<HStack alignItems={"center"} justifyContent={"space-between"} my={"10px"} borderRadius={10}>
												<HStack>
													{formatTransaction(data).profileImageUrl ?
														<Image borderRadius={100} resizeMode='contain' alt='logo-image' w={scale(40)} h={scale(40)} source={{ uri: formatTransaction(data).profileImageUrl }} />
														:
														<DefaultIcon
															value={formatTransaction(data).fullName || ""}
															contentContainerStyle={[styles.contentContainerStyle, { backgroundColor: GENERATE_RAMDOM_COLOR_BASE_ON_TEXT(formatTransaction(data).fullName || "") }]}
															textStyle={styles.textStyle}
														/>
													}
													<VStack ml={"10px"} justifyContent={"center"}>
														<Heading textTransform={"capitalize"} fontSize={scale(13)} color={"white"}>{MAKE_FULL_NAME_SHORTEN(formatTransaction(data).fullName || "")}</Heading>
														<Text fontSize={scale(10)} color={colors.lightSkyGray}>{moment(Number(data.createdAt)).format("lll")}</Text>
													</VStack>
												</HStack>
												<VStack ml={"10px"} justifyContent={"center"}>
													{formatTransaction(data).showPayButton ?
														<HStack space={1} px={"12px"} h={"40px"} bg={colors.mainGreen} borderRadius={25} color='white' justifyContent={"center"} alignItems={"center"}>
															<Heading textTransform={"capitalize"} fontSize={scale(12)} color={"white"}>Pagar</Heading>
															<Text fontWeight={"semibold"} fontSize={scale(11)} color={colors.white}>{FORMAT_CURRENCY(formatTransaction(data).amount)}</Text>
														</HStack>
														:
														<Heading opacity={data.status === "cancelled" ? 0.5 : 1} textDecorationLine={data.status === "cancelled" ? "line-through" : "none"} fontWeight={"bold"} textTransform={"capitalize"} fontSize={scale(14)} color={formatTransaction(data).amountColor}>{FORMAT_CURRENCY(formatTransaction(data).amount)}</Heading>
													}
												</VStack>
											</HStack>
										</Pressable>
									) : (
										<Pressable bg={colors.lightGray} my={"5px"} borderRadius={10} px={"15px"} py={"10px"} key={`transactions(tgrtgnrhbfhrbgr)-${data?.transactionId}-${index}-${data?.transactionId}`} _pressed={{ opacity: 0.5 }} onPress={() => onOpenBottomSheet(data)}>
											<HStack alignItems={"center"} justifyContent={"space-between"} my={"10px"} borderRadius={10}>
												<HStack>
													{data?.company?.logo ?
														<Image borderRadius={100} resizeMode='contain' alt='logo-image' w={scale(40)} h={scale(40)} source={{ uri: data?.company?.logo }} />
														:
														<DefaultIcon
															value={data?.phone?.fullName || ""}
															contentContainerStyle={[styles.contentContainerStyle, { backgroundColor: GENERATE_RAMDOM_COLOR_BASE_ON_TEXT(data?.phone?.fullName || "") }]}
															textStyle={styles.textStyle}
														/>
													}
													<VStack ml={"10px"} justifyContent={"center"}>
														<Heading textTransform={"capitalize"} fontSize={scale(13)} color={"white"}>{MAKE_FULL_NAME_SHORTEN(data?.phone?.fullName || "")}</Heading>
														<Text fontSize={scale(10)} color={colors.lightSkyGray}>{moment(Number(data?.createdAt)).format("lll")}</Text>
													</VStack>
												</HStack>
												<VStack ml={"10px"} justifyContent={"center"}>
													<Heading opacity={data?.status === "cancelled" ? 0.5 : 1} textDecorationLine={data?.status === "cancelled" ? "line-through" : "none"} fontWeight={"bold"} textTransform={"capitalize"} fontSize={scale(14)} color={colors.mainGreen}>{FORMAT_CURRENCY(data?.amount)}</Heading>
												</VStack>
											</HStack>
										</Pressable>
									)
								)}
							/>
						</VStack>
						: (
							<VStack mt={"20px"} w={"100%"} h={height / 3} px={"20px"} justifyContent={"flex-end"} >
								<Image resizeMode='contain' alt='logo-image' w={width} h={width / 2.5} source={noTransactions} />
								<VStack justifyContent={"center"} alignItems={"center"}>
									<Heading textTransform={"capitalize"} fontSize={scale(20)} color={"white"}>No hay transacciones</Heading>
									<Text fontSize={scale(14)} textAlign={"center"} color={"white"}>Todavía no hay transacciones para mostrar</Text>
								</VStack>
							</VStack>
						)
					}
					{isLoadingMore ? <Spinner mt={"10px"} size={"lg"} /> : null}
				</ScrollView>
				<BottomSheet height={height * 0.9} onCloseFinish={onCloseFinishSingleTransaction} open={showSingleTransaction}>
					<SingleSentTransaction iconImage={pendingClock} showPayButton={showPayButton} goNext={goNext} onClose={onCloseFinishSingleTransaction} title={singleTransactionTitle} />
				</BottomSheet>
				<SendTransaction open={showSendTransaction} onCloseFinish={onSendCloseFinish} onSendFinish={onSendCloseFinish} />
				<SingleTopTup open={openBottomSheet} onClose={onBottomSheetClose} topup={transaction} />
			</VStack>
		)
	)
}

export default Transactions

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