import React, { useEffect, useState, useRef } from 'react'
import colors from '@/colors'
import DefaultIcon from 'react-native-default-icon';
import BottomSheet from '@/components/global/BottomSheet';
import moment from 'moment';
import PagerView from 'react-native-pager-view';
import SingleSentTransaction from '@/components/transaction/SingleSentTransaction';
import * as Sharing from 'expo-sharing';
import { StyleSheet, Dimensions } from 'react-native'
import { Heading, Image, Text, VStack, FlatList, HStack, Pressable, ZStack } from 'native-base'
import { FORMAT_CURRENCY, FORMAT_PHONE_NUMBER, GENERATE_RAMDOM_COLOR_BASE_ON_TEXT, MAKE_FULL_NAME_SHORTEN } from '@/helpers'
import { scale } from 'react-native-size-matters';
import { useDispatch, useSelector } from 'react-redux';
import { transactionActions } from '@/redux/slices/transactionSlice';
import { cancelIcon, checked, noTransactions, pendingClock } from '@/assets';
import { router, useNavigation } from 'expo-router';
import { TEXT_HEADING_FONT_SIZE } from '@/constants';
import { transactionStatus } from '@/mocks';
import { Entypo } from '@expo/vector-icons';
import SingleTopTup from '../topups/SingleTopTup';


const { height, width } = Dimensions.get('window')
const RecentTransactions: React.FC = () => {
	const ref = useRef<PagerView>(null);
	const dispatch = useDispatch()
	const { user } = useSelector((state: any) => state.globalReducer)
	const { recentTopUps } = useSelector((state: any) => state.topupReducer)
	const { hasNewTransaction, recentTransactions } = useSelector((state: any) => state.transactionReducer)
	const isFocused = useNavigation().isFocused()

	const [singleTransactionTitle, setSingleTransactionTitle] = useState<string>("Ver Detalles");
	const [showSingleTransaction, setShowSingleTransaction] = useState<boolean>(false);
	const [needRefresh, setNeedRefresh] = useState<boolean>(false);
	const [showPayButton, setShowPayButton] = useState<boolean>(false);
	const [openBottomSheet, setOpenBottomSheet] = useState(false);
	const [transaction, setTransaction] = useState<any>({})
	const [transactions, setTransactions] = useState<any[]>([])



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

			setNeedRefresh(false)
	}

	const goNext = (next: number = 1) => {
		setShowPayButton(false)
		setNeedRefresh(true)
		ref.current?.setPage(next)
	}

	const onCloseFinish = async () => {
		setOpenBottomSheet(false)
		setTransaction({})
	}

	const onOpenBottomSheet = async (transaction: any) => {
		setTransaction(transaction)
		setOpenBottomSheet(true)
	}

	const StatuIcon = (status: string) => {
		const _w = "25px"
		const _h = "25px"
		if (status === "completed") {
			return (
				<ZStack w={_w} h={_h} borderRadius={100} justifyContent={"center"} alignItems={"center"} >
					<HStack w={"80%"} h={"80%"} bg={colors.mainGreen} borderRadius={100} />
					<Image borderRadius={100} tintColor={colors.lightGray} alt='logo-image' w={"100%"} h={"100%"} source={checked} />
				</ZStack>
			)
		} else if (status === "cancelled") {
			return (
				<ZStack w={_w} h={_h} borderRadius={100} justifyContent={"center"} alignItems={"center"} >
					<HStack w={"80%"} h={"80%"} bg={colors.white} borderRadius={100} />
					<Image borderRadius={100} alt='logo-image' w={"100%"} h={"100%"} source={cancelIcon} />
				</ZStack>
			)

		} else if (status === "pending") {
			return (
				<ZStack w={_w} h={_h} borderRadius={100} justifyContent={"center"} alignItems={"center"} >
					<HStack w={"80%"} h={"80%"} bg={colors.white} borderRadius={100} />
					<Image borderRadius={100} tintColor={colors.lightGray} alt='logo-image' w={"100%"} h={"100%"} source={pendingClock} />
				</ZStack>
			)
		} else if (status === "requested") {
			return (
				<ZStack w={_w} h={_h} borderRadius={100} justifyContent={"center"} alignItems={"center"} >
					<HStack w={"80%"} h={"80%"} bg={colors.gray} borderRadius={100} />
					<Image borderRadius={100} alt='logo-image' w={"100%"} h={"100%"} source={pendingClock} />
				</ZStack>
			)
		}
	}

	const handleShare = async () => {
		const isAvailableAsync = await Sharing.isAvailableAsync()
		if (!isAvailableAsync) return

		await Sharing.shareAsync("http://test.com")
	}

	useEffect(() => {
		const topupsMapped = recentTopUps?.map((topup: any) => {
			return {
				type: "topup",
				timestamp: topup.createdAt,
				data: topup
			}
		})

		const transactionsMapped = recentTransactions?.map((transaction: any) => {
			return {
				type: "transaction",
				timestamp: transaction.createdAt,
				data: transaction
			}
		})

		if (transactionsMapped?.length > 0 && topupsMapped?.length > 0) {
			const combinedTransactions = [...transactionsMapped, ...topupsMapped].sort((a: any, b: any) => {
				return new Date(Number(b.timestamp)).getTime() - new Date(Number(a.timestamp)).getTime()
			});

			setTransactions(combinedTransactions.slice(0, 10))
		}

	}, [recentTopUps, recentTransactions])

	useEffect(() => {
		(async () => {
			if (hasNewTransaction) {
				await dispatch(transactionActions.setHasNewTransaction(false))
			}
		})()

	}, [isFocused, hasNewTransaction])


	return (
		<VStack flex={1}>
			{transactions?.length > 0 ?
				<VStack w={"100%"} >
					<HStack w={"100%"} justifyContent={"space-between"}>
						<Heading fontSize={scale(18)} color={"white"}>{"Recientes"}</Heading>
						<Pressable _pressed={{ opacity: 0.5 }} onPress={() => router.navigate("/transactions")}>
							<Heading underline fontSize={scale(12)} color={colors.white}>{"Ver más"}</Heading>
						</Pressable>
					</HStack>
					<FlatList
						mt={"10px"}
						scrollEnabled={false}
						data={transactions}
						renderItem={({ item: { data, type }, index }: any) => (
							type === "transaction" ? (
								<Pressable bg={colors.lightGray} my={"5px"} borderRadius={10} px={"15px"} py={"10px"} key={`transactions(tgrtgnrhbfhrbgr)-${data.transactionId}-${index}-${data.transactionId}`} _pressed={{ opacity: 0.5 }} onPress={() => onSelectTransaction(data)}>
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
								<Pressable bg={colors.lightGray} my={"5px"} borderRadius={10} px={"15px"} py={"10px"} key={`transactions(tgrtgnrhbfhrbgr)-${data.transactionId}-${index}-${data.transactionId}`} _pressed={{ opacity: 0.5 }} onPress={() => onOpenBottomSheet(data)}>
									<HStack alignItems={"center"} justifyContent={"space-between"} my={"10px"} borderRadius={10}>
										<HStack>
											{data.company.logo ?
												<Image borderRadius={100} resizeMode='contain' alt='logo-image' w={scale(40)} h={scale(40)} source={{ uri: data.company.logo }} />
												:
												<DefaultIcon
													value={data.phone.fullName || ""}
													contentContainerStyle={[styles.contentContainerStyle, { backgroundColor: GENERATE_RAMDOM_COLOR_BASE_ON_TEXT(data.phone.fullName || "") }]}
													textStyle={styles.textStyle}
												/>
											}
											<VStack ml={"10px"} justifyContent={"center"}>
												<Heading textTransform={"capitalize"} fontSize={scale(13)} color={"white"}>{MAKE_FULL_NAME_SHORTEN(data.phone.fullName || "")}</Heading>
												<Text fontSize={scale(10)} color={colors.lightSkyGray}>{moment(Number(data.createdAt)).format("lll")}</Text>
											</VStack>
										</HStack>
										<VStack ml={"10px"} justifyContent={"center"}>
											<Heading opacity={data.status === "cancelled" ? 0.5 : 1} textDecorationLine={data.status === "cancelled" ? "line-through" : "none"} fontWeight={"bold"} textTransform={"capitalize"} fontSize={scale(14)} color={colors.mainGreen}>{FORMAT_CURRENCY(data.amount)}</Heading>
										</VStack>
									</HStack>
								</Pressable>
							)
						)}
					/>
					<BottomSheet height={height * 0.9} onCloseFinish={onCloseFinishSingleTransaction} open={showSingleTransaction}>
						<SingleSentTransaction iconImage={pendingClock} showPayButton={showPayButton} goNext={goNext} onClose={onCloseFinishSingleTransaction} title={singleTransactionTitle} />
					</BottomSheet>					
					<SingleTopTup open={openBottomSheet} onClose={onCloseFinish} topup={transaction}/>
				</VStack>
				: (
					<VStack w={"100%"} h={height / 3} px={"20px"} >
						<Image resizeMode='contain' alt='logo-image' w={width} h={width / 2.5} source={noTransactions} />
						<VStack justifyContent={"center"} alignItems={"center"}>
							<Heading textTransform={"capitalize"} fontSize={scale(20)} color={"white"}>Recientes</Heading>
							<Text fontSize={scale(14)} w={"90%"} textAlign={"center"} color={"white"}>No hay transacciones recentes para mostrar.</Text>
						</VStack>
					</VStack>
				)
			}
		</VStack>
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