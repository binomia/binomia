import React, { useCallback, useEffect, useState, useRef } from 'react'
import colors from '@/colors'
import DefaultIcon from 'react-native-default-icon';
import BottomSheet from '@/components/global/BottomSheet';
import moment from 'moment';
import SendTransaction from '@/components/transaction/SendTransaction';
import TransactionSkeleton from '@/components/transaction/transactionSkeleton';
import PagerView from 'react-native-pager-view';
import SingleSentTransaction from '@/components/transaction/SingleSentTransaction';
import { StyleSheet, Dimensions, TouchableOpacity, RefreshControl } from 'react-native'
import { Heading, Image, Text, VStack, FlatList, HStack, Pressable, ScrollView } from 'native-base'
import { useLazyQuery } from '@apollo/client'
import { FORMAT_CURRENCY, GENERATE_RAMDOM_COLOR_BASE_ON_TEXT, MAKE_FULL_NAME_SHORTEN } from '@/helpers'
import { scale } from 'react-native-size-matters';
import { useDispatch, useSelector } from 'react-redux';
import { transactionActions } from '@/redux/slices/transactionSlice';
import { TransactionApolloQueries } from '@/apollo/query/transactionQuery';
import { noTransactions, pendingClock } from '@/assets';
import { router, useNavigation } from 'expo-router';

type Props = {
	showNewTransaction?: boolean;
}

const { height, width } = Dimensions.get('window')
const RecentTransactions: React.FC<Props> = ({ showNewTransaction = true }: Props) => {
	const ref = useRef<PagerView>(null);
	const dispatch = useDispatch()
	const { user } = useSelector((state: any) => state.globalReducer)
	const { hasNewTransaction } = useSelector((state: any) => state.transactionReducer)
	const isFocused = useNavigation().isFocused()
	const [accountTransactions] = useLazyQuery(TransactionApolloQueries.accountTransactions())

	const [singleTransactionTitle, setSingleTransactionTitle] = useState<string>("Ver Detalles");
	const [refreshing, setRefreshing] = useState(false);
	const [transactions, setTransactions] = useState<any[]>([])
	const [filteredTransactions, setFilteredTransactions] = useState<any[]>([])
	const [showSingleTransaction, setShowSingleTransaction] = useState<boolean>(false);
	const [showSendTransaction, setShowSendTransaction] = useState<boolean>(false);
	const [isLoading, setIsLoading] = useState<boolean>(true);
	const [needRefresh, setNeedRefresh] = useState<boolean>(false);
	const [showPayButton, setShowPayButton] = useState<boolean>(false);

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

	const fetchAccountTransactions = async (page: number = 1, pageSize: number = showNewTransaction ? 10 : 4) => {
		try {
			const { data } = await accountTransactions({
				variables: {
					"page": page,
					"pageSize": pageSize
				}
			})

			setTransactions(data.accountTransactions)
			setFilteredTransactions(data.accountTransactions)
			setIsLoading(false)

		} catch (error) {
			console.error(error)
		}
	}

	const onSelectTransaction = async (transaction: any) => {
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
		fetchAccountTransactions()
	}, [])

	return (
		isLoading ? <TransactionSkeleton /> : (
			<VStack flex={1} pt={"20px"} bg={colors.darkGray}>
				<ScrollView flex={1} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />} contentContainerStyle={{ paddingBottom: 30 }}>
					{filteredTransactions.length > 0 ?
						<VStack w={"100%"} >
							<HStack w={"100%"} justifyContent={"space-between"}>
								<Heading px={showNewTransaction ? "20px" : "0px"} fontSize={scale(18)} color={"white"}>{"Recientes"}</Heading>
								<Pressable _pressed={{ opacity: 0.5 }} onPress={() => router.navigate("/transactions")}>
									<Heading px={showNewTransaction ? "20px" : "0px"} underline fontSize={scale(12)} color={colors.white}>{"Ver más"}</Heading>
								</Pressable>
							</HStack>

							<FlatList
								px={showNewTransaction ? "20px" : "0px"}
								mt={"10px"}
								scrollEnabled={false}
								data={transactions}							
								renderItem={({ item, index }: any) => (
									<Pressable bg={colors.lightGray} my={"5px"} borderRadius={10} px={"15px"} py={"10px"} key={`transactions(tgrtgnrhbfhrbgr)-${item.transactionId}-${index}-${item.transactionId}`} _pressed={{ opacity: 0.5 }} onPress={() => onSelectTransaction(item)}>
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
													<Heading opacity={item.status === "cancelled" ? 0.5 : 1} textDecorationLine={item.status === "cancelled" ? "line-through" : "none"} fontWeight={"bold"} textTransform={"capitalize"} fontSize={scale(14)} color={formatTransaction(item).amountColor}>{FORMAT_CURRENCY(formatTransaction(item).amount)}</Heading>
												}
											</VStack>
										</HStack>
									</Pressable>
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
				</ScrollView>
				<BottomSheet height={height * 0.9} onCloseFinish={onCloseFinishSingleTransaction} open={showSingleTransaction}>
					<SingleSentTransaction iconImage={pendingClock} showPayButton={showPayButton} goNext={goNext} onClose={onCloseFinishSingleTransaction} title={singleTransactionTitle} />
				</BottomSheet>
				<SendTransaction open={showSendTransaction} onCloseFinish={onSendCloseFinish} onSendFinish={onSendCloseFinish} />
			</VStack>
		)
	)
}

export default RecentTransactions

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