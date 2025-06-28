import React, { useEffect, useState, useRef } from 'react'
import colors from '@/colors'
import BottomSheet from '@/components/global/BottomSheet';
import PagerView from 'react-native-pager-view';
import SingleSentTransaction from '@/components/transaction/SingleSentTransaction';
import SingleTopTup from '../topups/SingleTopTup';
import { Dimensions } from 'react-native'
import { Heading, Image, Text, VStack, FlatList, HStack, Pressable, Avatar } from 'native-base'
import { EXTRACT_FIRST_LAST_INITIALS, FORMAT_CREATED_DATE, FORMAT_CURRENCY, GENERATE_RAMDOM_COLOR_BASE_ON_TEXT, MAKE_FULL_NAME_SHORTEN } from '@/helpers'
import { scale } from 'react-native-size-matters';
import { useDispatch, useSelector } from 'react-redux';
import { transactionActions } from '@/redux/slices/transactionSlice';
import { noTransactions, pendingClock } from '@/assets';
import { router, useNavigation } from 'expo-router';
import { fetchRecentTopUps, fetchRecentTransactions } from '@/redux/fetchHelper';


const { height, width } = Dimensions.get('window')
const RecentTransactions: React.FC = () => {
	const ref = useRef<PagerView>(null);
	const dispatch = useDispatch()
	const { user } = useSelector((state: any) => state.accountReducer)
	const { hasNewTransaction, recentTransactions } = useSelector((state: any) => state.transactionReducer)
	const isFocused = useNavigation().isFocused()

	const [singleTransactionTitle, setSingleTransactionTitle] = useState<string>("Ver Detalles");
	const [showSingleTransaction, setShowSingleTransaction] = useState<boolean>(false);
	const [needRefresh, setNeedRefresh] = useState<boolean>(false);
	const [showPayButton, setShowPayButton] = useState<boolean>(false);
	const [openBottomSheet, setOpenBottomSheet] = useState(false);
	const [transaction, setTransaction] = useState<any>({})
	const [bottomSheetHeught, setBottomSheetHeught] = useState<number>(height * 0.9);

	const delay = async (ms: number) => new Promise(res => setTimeout(res, ms))

	const formatTransaction = (transaction: any) => {
		const { transactionType, status } = transaction
		const isFromMe = transaction.from.user?.id === user?.id

		const profileImageUrl = isFromMe ? transaction.to.user?.profileImageUrl : transaction.from.user?.profileImageUrl
		const fullName = isFromMe ? transaction.to.user?.fullName : transaction.from.user?.fullName
		const username = isFromMe ? transaction.to.user?.username : transaction.from.user?.username
		const showPayButton = transaction?.transactionType === "request" && !isFromMe && transaction.status === "requested"
		const showMap = (transaction?.transactionType === "request" && isFromMe) || (transaction?.transactionType === "transfer" && !isFromMe) ? false : true

		let amountColor;

		if ((transactionType === "request" && isFromMe && status === "requested") || (transaction.status === "waiting")) {
			amountColor = colors.pureGray

		} else if ((transaction?.transactionType === "request" && isFromMe || transaction?.transactionType === "transfer" && !isFromMe) && transaction.status !== "cancelled") {
			amountColor = colors.mainGreen

		} else {
			amountColor = colors.red
		}

		return {
			isFromMe: isFromMe && transaction?.location?.uri,
			isSuspicious: transaction.status === "suspicious",
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
		const formatedTransaction = formatTransaction(transaction)

		if (transaction?.status === "suspicious")
			setBottomSheetHeught(!formatedTransaction.isFromMe ? height * 0.7 : height * 0.9)
		else
			setBottomSheetHeught(!formatedTransaction.isFromMe ? height * 0.5 : height * 0.9)

		await dispatch(transactionActions.setTransaction(Object.assign({}, transaction, { ...formatedTransaction })))

		setShowPayButton(formatedTransaction.showPayButton)
		setShowSingleTransaction(true)
		setSingleTransactionTitle(formatedTransaction.showPayButton ? "Pagar" : "Ver Detalles")
	}

	const onCloseFinishSingleTransaction = async (goToSupport: boolean = false) => {
		setShowSingleTransaction(false)

		await dispatch(fetchRecentTransactions())
		await dispatch(fetchRecentTopUps())

		if (needRefresh)
			setNeedRefresh(false)

		if (goToSupport) {
			await delay(1500)
			router.navigate("/support")
		}
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

	useEffect(() => {
		(async () => {
			if (hasNewTransaction) {
				await dispatch(transactionActions.setHasNewTransaction(false))
			}
		})()

	}, [isFocused, hasNewTransaction])

	return (
		<VStack flex={1}>
			{recentTransactions?.length > 0 ?
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
						data={recentTransactions}
						renderItem={({ item: { data, type }, index }: any) => (
							type === "transaction" ? (
								<Pressable bg={colors.lightGray} my={"5px"} borderRadius={10} px={"15px"} py={"10px"} key={`transactions(tgrtgnrhbfhrbgr)-${data.transactionId}-${index}-${data.transactionId}`} _pressed={{ opacity: 0.5 }} onPress={() => onSelectTransaction(data)}>
									<HStack alignItems={"center"} justifyContent={"space-between"} my={"10px"} borderRadius={10}>
										<HStack>
											{formatTransaction(data).profileImageUrl ?
												<Image borderRadius={100} resizeMode='contain' alt='logo-image' w={scale(40)} h={scale(40)} source={{ uri: formatTransaction(data).profileImageUrl }} />
												:
												<Avatar borderRadius={100} w={"50px"} h={"50px"} bg={GENERATE_RAMDOM_COLOR_BASE_ON_TEXT(formatTransaction(data).fullName || "")}>
													<Heading size={"sm"} color={colors.white}>
														{EXTRACT_FIRST_LAST_INITIALS(formatTransaction(data).fullName || "0")}
													</Heading>
												</Avatar>
											}
											<VStack ml={"10px"} justifyContent={"center"}>
												<Heading textTransform={"capitalize"} fontSize={scale(13)} color={"white"}>{MAKE_FULL_NAME_SHORTEN(formatTransaction(data).fullName || "")}</Heading>
												<Text fontSize={scale(10)} color={colors.lightSkyGray}>{FORMAT_CREATED_DATE(data?.createdAt)}</Text>
											</VStack>
										</HStack>
										<VStack ml={"10px"} justifyContent={"center"}>
											{formatTransaction(data).showPayButton ?
												<HStack space={1} px={"12px"} h={"40px"} bg={colors.mainGreen} borderRadius={25} color='white' justifyContent={"center"} alignItems={"center"}>
													<Heading textTransform={"capitalize"} fontSize={scale(12)} color={"white"}>Pagar</Heading>
													<Text fontWeight={"semibold"} fontSize={scale(11)} color={colors.white}>{FORMAT_CURRENCY(formatTransaction(data).amount)}</Text>
												</HStack>
												:
												<Heading opacity={(data.status === "cancelled" || data.status === "suspicious") ? 0.5 : 1} textDecorationLine={(data.status === "cancelled" || data.status === "suspicious") ? "line-through" : "none"} fontWeight={"bold"} textTransform={"capitalize"} fontSize={scale(14)} color={formatTransaction(data).amountColor}>{FORMAT_CURRENCY(formatTransaction(data).amount)}</Heading>
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
												<Avatar borderRadius={100} w={"50px"} h={"50px"} bg={GENERATE_RAMDOM_COLOR_BASE_ON_TEXT(data.phone.fullName || "")}>
													<Heading size={"sm"} color={colors.white}>
														{EXTRACT_FIRST_LAST_INITIALS(data.phone.fullName || "0")}
													</Heading>
												</Avatar>
											}
											<VStack ml={"10px"} justifyContent={"center"}>
												<Heading textTransform={"capitalize"} fontSize={scale(13)} color={"white"}>{MAKE_FULL_NAME_SHORTEN(data.phone.fullName || "")}</Heading>
												<Text fontSize={scale(10)} color={colors.lightSkyGray}>{FORMAT_CREATED_DATE(data?.createdAt)}</Text>
											</VStack>
										</HStack>
										<VStack ml={"10px"} justifyContent={"center"}>
											<Heading opacity={data.status === "cancelled" ? 0.5 : 1} textDecorationLine={data.status === "cancelled" ? "line-through" : "none"} fontWeight={"bold"} textTransform={"capitalize"} fontSize={scale(14)} color={colors.red}>{FORMAT_CURRENCY(data.amount)}</Heading>
										</VStack>
									</HStack>
								</Pressable>
							)
						)}
					/>
					<BottomSheet height={bottomSheetHeught} onCloseFinish={onCloseFinishSingleTransaction} open={showSingleTransaction}>
						<SingleSentTransaction iconImage={pendingClock} showPayButton={showPayButton} goNext={goNext} onClose={onCloseFinishSingleTransaction} title={singleTransactionTitle} />
					</BottomSheet>
					<SingleTopTup open={openBottomSheet} onClose={onCloseFinish} topup={transaction} />
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
