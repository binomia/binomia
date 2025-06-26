import React, { useRef, useState } from 'react'
import colors from '@/colors'
import Button from '@/components/global/Button';
import moment from 'moment';
import PagerView from 'react-native-pager-view';
import * as Sharing from 'expo-sharing';
import { Dimensions } from 'react-native'
import { Heading, Image, Text, VStack, HStack, Pressable, ZStack, Avatar } from 'native-base'
import { EXTRACT_FIRST_LAST_INITIALS, FORMAT_CURRENCY, GENERATE_RAMDOM_COLOR_BASE_ON_TEXT, getMapLocationImage, MAKE_FULL_NAME_SHORTEN } from '@/helpers'
import { scale } from 'react-native-size-matters';
import { useDispatch, useSelector } from 'react-redux';
import { useMutation } from '@apollo/client';
import { TransactionApolloQueries } from '@/apollo/query/transactionQuery';
import { transactionActions } from '@/redux/slices/transactionSlice';
import { transactionStatus } from '@/mocks';
import { Ionicons, Entypo } from '@expo/vector-icons';
import { cancelIcon, checked, pendingClock, suspicious, waiting } from '@/assets';
import { z } from 'zod';
import { TransactionAuthSchema } from '@/auth/transactionAuth';
import { useLocalAuthentication } from '@/hooks/useLocalAuthentication';
import { accountActions } from '@/redux/slices/accountSlice';
import { fetchRecentTransactions } from '@/redux/fetchHelper';



type Props = {
	title?: string
	goNext?: (_?: number) => void,
	onClose?: () => Promise<void>,
	showPayButton?: boolean
	iconImage?: any
}

const { height } = Dimensions.get('window')
const SingleSentTransaction: React.FC<Props> = ({ title = "Ver Detalles", onClose = () => { }, showPayButton = false, goNext = (_?: number) => { } }) => {
	const ref = useRef<PagerView>(null);
	const dispatch = useDispatch()
	const { authenticate } = useLocalAuthentication()
	const { location } = useSelector((state: any) => state.globalReducer)
	const { transaction, recentTransactions, transactionDeytails, receiver } = useSelector((state: any) => state.transactionReducer)
	const { account, user }: { account: any, user: any, location: z.infer<typeof TransactionAuthSchema.transactionLocation> } = useSelector((state: any) => state.accountReducer)

	const [isLoading, setIsLoading] = useState<boolean>(false)
	const [isCancelLoading, setIsCancelLoading] = useState<boolean>(false)
	const [payRequestTransaction] = useMutation(TransactionApolloQueries.payRequestTransaction());
	const [cancelRequestedTransaction] = useMutation(TransactionApolloQueries.cancelRequestedTransaction());

	const handleShare = async () => {
		const isAvailableAsync = await Sharing.isAvailableAsync()
		if (!isAvailableAsync) return

		await Sharing.shareAsync("http://test.com")
	}

	const formatTransaction = (transaction: any) => {
		const isFromMe = transaction?.from.user?.id === user.id

		const profileImageUrl = isFromMe ? transaction?.to.user?.profileImageUrl : transaction?.from.user?.profileImageUrl
		const fullName = isFromMe ? transaction?.to.user?.fullName : transaction?.from.user?.fullName
		const username = isFromMe ? transaction?.from.user?.username : transaction?.to.user?.username
		const showPayButton = transaction?.transactionType === "request" && !isFromMe && transaction?.status === "pending"
		const amountColor = (transaction?.transactionType === "request" && isFromMe) ? colors.mainGreen : colors.red

		return {
			isFromMe,
			amountColor,
			profileImageUrl: profileImageUrl || "",
			amount: transaction?.amount,
			showPayButton,
			fullName: fullName || "",
			username: username || ""
		}
	}

	const onCancelRequestedTransaction = async () => {
		setIsCancelLoading(true)
		const { data } = await cancelRequestedTransaction({
			variables: {
				transactionId: transaction.transactionId
			}
		})

		await dispatch(transactionActions.setRecentTransactions([
			{
				type: "transaction",
				...data.cancelRequestedTransaction
			},
			...recentTransactions
		]))

		await dispatch(transactionActions.setTransaction(Object.assign({}, transaction, { ...data.cancelRequestedTransaction, ...formatTransaction(data.cancelRequestedTransaction) })))

		setIsCancelLoading(false)
	}

	const onPress = async (paymentApproved: boolean) => {
		if (transaction?.showPayButton) {
			try {
				const authenticated = await authenticate()

				if (authenticated.success) {
					setIsCancelLoading(!paymentApproved)
					setIsLoading(paymentApproved)

					const { data } = await payRequestTransaction({
						variables: {
							transactionId: transaction.transactionId,
							paymentApproved
						}
					})

					await dispatch(transactionActions.setTransaction(Object.assign({}, transaction, { ...data.payRequestTransaction, ...formatTransaction(data.payRequestTransaction) })))
					await dispatch(accountActions.setAccount(Object.assign({}, account, { balance: Number(account.balance) - Number(transaction?.amount) })))
					await dispatch(fetchRecentTransactions())

					setIsLoading(false)
					setIsCancelLoading(false)
					goNext(paymentApproved ? 1 : 2)
				}

			} catch (_: any) {
				setIsLoading(false)
				await dispatch(fetchRecentTransactions())
				onClose()
			}

		} else
			ref.current?.setPage(1)
	}

	const StatuIcon: React.FC<{ status: string }> = ({ status }: { status: string }) => {
		if (status === "completed") {
			return (
				<ZStack w={"35px"} h={"35px"} borderRadius={100} justifyContent={"center"} alignItems={"center"} >
					<HStack w={"80%"} h={"80%"} bg={colors.mainGreen} borderRadius={100} />
					<Image borderRadius={100} tintColor={colors.lightGray} alt='logo-image' w={"100%"} h={"100%"} source={checked} />
				</ZStack>
			)
		} else if (status === "cancelled") {
			return (
				<ZStack w={"35px"} h={"35px"} borderRadius={100} justifyContent={"center"} alignItems={"center"} >
					<HStack w={"80%"} h={"80%"} bg={colors.white} borderRadius={100} />
					<Image borderRadius={100} alt='logo-image' w={"100%"} h={"100%"} source={cancelIcon} />
				</ZStack>
			)

		} else if (status === "pending") {
			return (
				<ZStack w={"35px"} h={"35px"} borderRadius={100} justifyContent={"center"} alignItems={"center"} >
					<HStack w={"80%"} h={"80%"} bg={colors.gray} borderRadius={100} />
					<Image borderRadius={100} alt='logo-image' w={"100%"} h={"100%"} source={pendingClock} />
				</ZStack>
			)
		} else if (status === "waiting") {
			return (
				<ZStack w={"35px"} h={"35px"} borderRadius={100} justifyContent={"center"} alignItems={"center"} >
					<HStack w={"80%"} h={"80%"} bg={colors.gray} borderRadius={100} />
					<Image borderRadius={100} alt='logo-image' w={"100%"} h={"100%"} source={waiting} />
				</ZStack>
			)
		} else if (status === "requested") {
			return (
				<ZStack w={"35px"} h={"35px"} borderRadius={100} justifyContent={"center"} alignItems={"center"} >
					<HStack w={"80%"} h={"80%"} bg={colors.gray} borderRadius={100} />
					<Image borderRadius={100} alt='logo-image' w={"100%"} h={"100%"} source={pendingClock} />
				</ZStack>
			)
		} else if (status === "suspicious") {
			return (
				<ZStack w={"35px"} h={"35px"} borderRadius={100} justifyContent={"center"} alignItems={"center"} >
					<Image borderRadius={100} tintColor={colors.goldenYellow} alt='logo-image' w={"100%"} h={"100%"} source={suspicious} />
				</ZStack>
			)
		}
	}

	return (
		<VStack h={"90%"} px={"20px"} justifyContent={"space-between"}>
			<VStack pt={"20px"}>
				<HStack w={"100%"} justifyContent={"space-between"} alignItems={"center"}>
					<HStack>
						{receiver?.profileImageUrl ?
							<Image borderRadius={100} resizeMode='contain' alt='logo-image' w={scale(50)} h={scale(50)} source={{ uri: receiver?.profileImageUrl }} />
							:
							<Avatar borderRadius={100} w={"50px"} h={"50px"} bg={GENERATE_RAMDOM_COLOR_BASE_ON_TEXT(receiver?.fullName || "")}>
								<Heading size={"sm"} color={colors.white}>
									{EXTRACT_FIRST_LAST_INITIALS(receiver?.fullName || "0")}
								</Heading>
							</Avatar>
						}
						<VStack ml={"10px"} >
							<Heading textTransform={"capitalize"} fontSize={scale(20)} color={"white"}>{MAKE_FULL_NAME_SHORTEN(receiver?.fullName || "")}</Heading>
							<Text fontSize={scale(15)} color={colors.lightSkyGray}>{receiver?.username}</Text>
						</VStack>
					</HStack>
					<Pressable mb={"20px"} _pressed={{ opacity: 0.5 }} bg={colors.lightGray} onPress={handleShare} w={"40px"} h={"40px"} borderRadius={100} alignItems={"center"} justifyContent={"center"}>
						<Entypo name="share" size={20} color={colors.mainGreen} />
					</Pressable>
				</HStack>
				<VStack>
					<VStack mt={"20px"} alignItems={"center"}>
						<Heading textTransform={"capitalize"} fontSize={scale(38)} color={colors.white}>{FORMAT_CURRENCY(transactionDeytails?.amount)}</Heading>
						<Text mb={"10px"} color={colors.lightSkyGray}>{moment(Date.now()).format("lll")}</Text>
						{transaction.isFromMe ? <VStack my={"20px"} textAlign={"center"} space={1} alignItems={"center"}>
							<StatuIcon status={"pending"} />
							<VStack w={"80%"}>
								<Text textAlign={"center"} fontSize={scale(14)} color={colors.white}>{transactionStatus("pending")}</Text>
							</VStack>
						</VStack> : null}
					</VStack>
				</VStack>
			</VStack>
			{showPayButton ?
				<VStack w={"100%"} borderRadius={15} alignItems={"center"}>
					<HStack w={"40px"} h={"40px"} bg={colors.lightGray} borderRadius={100} justifyContent={"center"} alignItems={"center"}>
						<Ionicons name="warning" size={22} color={colors.warning} />
					</HStack>
					<Text textAlign={"center"} w={"85%"} fontSize={scale(15)} color={colors.pureGray}>
						Responde solo a solicitudes de pago que conozcas con certeza para garantizar tu seguridad.
					</Text>
					<HStack w={"100%"} mt={"20px"} justifyContent={showPayButton ? "space-between" : "center"}>
						<Button
							onPress={() => onPress(false)}
							disabled={isLoading}
							opacity={isLoading ? 0.5 : 1}
							spin={isCancelLoading}
							w={"49%"}
							bg={colors.lightGray}
							color={colors.red}
							title={"Cancelar"}
						/>
						<Button
							disabled={isCancelLoading}
							opacity={isCancelLoading ? 0.5 : 1}
							onPress={() => onPress(true)}
							spin={isLoading}
							w={showPayButton ? "49%" : "80%"}
							bg={colors.mainGreen}
							color={colors.white}
							title={title}
						/>
					</HStack>
				</VStack>
				: transaction.isFromMe ?
					<VStack w={"100%"} justifyContent={"center"}>
						<HStack w={"85%"} mb={"5px"}>
							<Heading fontSize={scale(16)} textTransform={"capitalize"} color={"white"}>{transaction.location?.fullArea || "Ubicación"}</Heading>
						</HStack>
						<Image
							alt='fine-location-image-alt'
							resizeMode="cover"
							w={"100%"}
							h={height / 3}
							source={{
								uri: getMapLocationImage({ latitude: location?.latitude, longitude: location?.longitude })
							}}
							style={{
								borderRadius: 10
							}}
						/>
						{transaction.status === "requested" ? <HStack mt={"20px"} w={"100%"} justifyContent={"center"}>
							<Button
								onPress={onCancelRequestedTransaction}
								spin={isCancelLoading}
								w={"49%"}
								bg={colors.lightGray}
								color={colors.red}
								title={"Cancelar"}
							/>
						</HStack> : null}
					</VStack> :
					<VStack my={"20px"} textAlign={"center"} space={1} alignItems={"center"}>
						<VStack my={"20px"} textAlign={"center"} space={1} alignItems={"center"}>
							<StatuIcon status={"pending"} />
							<VStack w={"80%"}>
								<Text textAlign={"center"} fontSize={scale(14)} color={colors.white}>{transactionStatus("pending")}</Text>
							</VStack>
						</VStack>
					</VStack>
			}
		</VStack>
	)
}

export default SingleSentTransaction
