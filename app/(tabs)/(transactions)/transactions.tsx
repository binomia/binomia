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
import { StyleSheet, Keyboard, Dimensions, TouchableWithoutFeedback, TouchableOpacity, RefreshControl, NativeSyntheticEvent, NativeScrollEvent } from 'react-native'
import { Heading, Image, Text, VStack, FlatList, HStack, Spinner, Pressable, ScrollView } from 'native-base'
import { useLazyQuery } from '@apollo/client'
import { UserApolloQueries } from '@/apollo/query'
import { UserAuthSchema } from '@/auth/userAuth'
import { z } from 'zod'
import { FORMAT_CURRENCY, FORMAT_FULL_NAME, GENERATE_RAMDOM_COLOR_BASE_ON_TEXT, MAKE_FULL_NAME_SHORTEN } from '@/helpers'
import { scale } from 'react-native-size-matters';
import { useDispatch, useSelector } from 'react-redux';
import { transactionActions } from '@/redux/slices/transactionSlice';
import { TransactionApolloQueries } from '@/apollo/query/transactionQuery';
import { noTransactions, pendingClock } from '@/assets';
import { router, useNavigation } from 'expo-router';
import Transactions from '@/components/transaction/transactions';


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
		const isFromMe = transaction.from.user?.id === user.id

		const profileImageUrl = isFromMe ? transaction.to.user?.profileImageUrl : transaction.from.user?.profileImageUrl
		const fullName = isFromMe ? transaction.to.user?.fullName : transaction.from.user?.fullName
		const username = isFromMe ? transaction.from.user?.username : transaction.to.user?.username
		const showPayButton = transaction.transactionType === "request" && !isFromMe && transaction.status === "requested"
		const amountColor = (transaction.transactionType === "request" && isFromMe || transaction.transactionType === "transfer" && !isFromMe) && transaction.status !== "cancelled" ? colors.mainGreen : colors.red
		const showMap = (transaction.transactionType === "request" && isFromMe) || (transaction.transactionType === "transfer" && !isFromMe) ? false : true

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
			if (isBottom && transactions.length >= 10) {
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
		isLoading ? <TransactionSkeleton /> : < Transactions />
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