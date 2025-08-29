import React, { useRef, useState } from 'react'
import colors from '@/colors'
import Button from '@/components/global/Button';
import PagerView from 'react-native-pager-view';
import * as Sharing from 'expo-sharing';
import { Dimensions } from 'react-native'
import { Heading, Image, Text, VStack, HStack, Pressable, ZStack, Avatar } from 'native-base'
import { EXTRACT_FIRST_LAST_INITIALS, FORMAT_CREATED_DATE, FORMAT_CURRENCY, GENERATE_RAMDOM_COLOR_BASE_ON_TEXT, MAKE_FULL_NAME_SHORTEN } from '@/helpers'
import { scale } from 'react-native-size-matters';
import { useDispatch, useSelector } from 'react-redux';
import { useMutation } from '@apollo/client';
import { TransactionApolloQueries } from '@/apollo/query/transactionQuery';
import { transactionActions } from '@/redux/slices/transactionSlice';
import { transactionStatus } from '@/mocks';
import { Ionicons, Entypo, AntDesign, MaterialIcons } from '@expo/vector-icons';
import { cancelIcon, checked, pendingClock, suspicious, waiting } from '@/assets';
import { z } from 'zod';
import { TransactionAuthSchema } from '@/auth/transactionAuth';
import { useLocalAuthentication } from '@/hooks/useLocalAuthentication';
import { accountActions } from '@/redux/slices/accountSlice';
import { fetchAllTransactions, fetchRecentTransactions } from '@/redux/fetchHelper';


type Props = {
	title?: string
	goNext?: (_?: number) => void,
	onClose?: (_?: boolean) => Promise<void>,
	showPayButton?: boolean
	iconImage?: any
}

const { height } = Dimensions.get('window')
const SingleSentTransaction: React.FC<Props> = ({ title = "Ver Detalles", onClose = async (_?: boolean) => { }, showPayButton = false, goNext = (_?: number) => { } }) => {
	const ref = useRef<PagerView>(null);
	const dispatch = useDispatch()
	const { authenticate } = useLocalAuthentication()
	const { transaction } = useSelector((state: any) => state.transactionReducer)
	const { account, user }: { account: any, user: any, location: z.infer<typeof TransactionAuthSchema.transactionLocation> } = useSelector((state: any) => state.accountReducer)
	const [isLoading, setIsLoading] = useState<boolean>(false)
	const [isCancelLoading, setIsCancelLoading] = useState<boolean>(false)
	const [isPaying, setIsPaying] = useState<boolean>(false)
	const [payRequestTransaction] = useMutation(TransactionApolloQueries.payRequestTransaction());
	const [cancelRequestedTransaction] = useMutation(TransactionApolloQueries.cancelRequestedTransaction());
	const imageRef = useRef<typeof Image>(null)

	const handleShare = async () => {
		const isAvailableAsync = await Sharing.isAvailableAsync()
		if (!isAvailableAsync) return

		await Sharing.shareAsync("http://test.com")
	}

	const formatTransaction = (transaction: any) => {
		const isFromMe = transaction?.from.user?.id === user.id

		const profileImageUrl = isFromMe ? transaction?.to.user?.profileImageUrl : transaction?.from.user?.profileImageUrl
		const fullName = isFromMe ? transaction?.to.user?.fullName : transaction?.from.user?.fullName
		const username = isFromMe ? transaction?.to.user?.username : transaction?.from.user?.username
		const showPayButton = transaction?.transactionType === "request" && !isFromMe && transaction?.status === "pending"
		const amountColor = (transaction?.transactionType === "request" && isFromMe) ? colors.mainGreen : colors.red

		return {
			isFromMe: isFromMe && transaction?.location?.uri,
			amountColor,
			profileImageUrl: profileImageUrl || "",
			amount: transaction?.amount,
			showPayButton,
			fullName: fullName || "",
			username: username || ""
		}
	}

	const onCancelRequestedTransaction = async () => {
		try {
			setIsCancelLoading(true)
			await cancelRequestedTransaction({
				variables: {
					transactionId: transaction.transactionId
				}
			})

			await dispatch(fetchRecentTransactions())
			await dispatch(fetchAllTransactions({ page: 1, pageSize: 5 }))
			await dispatch(transactionActions.setTransaction(Object.assign({}, transaction, {
				status: "deleting",
			})))

			setIsCancelLoading(false)

		} catch (_: any) {
			setIsCancelLoading(false)
		}
	}

	const onPress = async (paymentApproved: boolean) => {
		if (transaction?.showPayButton) {
			try {
				const authenticated = await authenticate()
				setIsCancelLoading(!paymentApproved)
				setIsLoading(paymentApproved)

				if (authenticated.success) {
					setIsPaying(true)
					const { data } = await payRequestTransaction({
						variables: {
							transactionId: transaction.transactionId,
							paymentApproved
						}
					})

					await Promise.all([
						dispatch(fetchRecentTransactions()),
						dispatch(fetchAllTransactions({ page: 1, pageSize: 5 })),
						dispatch(transactionActions.setTransaction(Object.assign({}, transaction, { ...data.payRequestTransaction, ...formatTransaction(data.payRequestTransaction) }))),
						dispatch(accountActions.setAccount(Object.assign({}, account, { balance: Number(account.balance) - Number(transaction?.amount) })))
					])


					goNext(paymentApproved ? 1 : 2)
				}

			} catch (_: any) {
				setIsLoading(false)
				await dispatch(fetchRecentTransactions())
				onClose()

			} finally {
				setIsLoading(false)
				setIsCancelLoading(false)
				setIsPaying(false)
			}

		}
		else {
			setIsLoading(false)
			setIsCancelLoading(false)
			setIsPaying(false)
			ref.current?.setPage(1)
		}
	}

	const StatuIcon: React.FC<{ status: string }> = ({ status }: { status: string }) => {
		if (status === "completed") {
			return (
				<ZStack w={"35px"} h={"35px"} borderRadius={100} justifyContent={"center"} alignItems={"center"} >
					<HStack w={"80%"} h={"80%"} bg={colors.mainGreen} borderRadius={100} />
					<Image borderRadius={100} tintColor={colors.lightGray} alt='logo-image' w={"100%"} h={"100%"} source={checked} />
				</ZStack>
			)
		} else if (status === "cancelled" || status === "deleting") {
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
				<ZStack w={"60px"} h={"60px"} borderRadius={100} justifyContent={"center"} alignItems={"center"} >
					<HStack w={"100%"} h={"100%"} bg={colors.lightGray} borderRadius={100} />
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
					<Image resizeMethod="resize" tintColor={colors.goldenYellow} borderRadius={100} alt='logo-image' w={"100%"} h={"100%"} source={suspicious} />
				</ZStack>
			)
		}
	}

	return (
		<VStack h={"90%"} px={"20px"} justifyContent={"space-between"}>
			<VStack pt={"20px"}>
				<HStack w={"100%"} justifyContent={"space-between"} alignItems={"center"}>
					<HStack>
						{transaction?.profileImageUrl ?
							<Image borderRadius={100} resizeMode='contain' alt='logo-image' w={scale(50)} h={scale(50)} source={{ uri: transaction?.profileImageUrl }} />
							:
							<Avatar borderRadius={100} w={"50px"} h={"50px"} bg={GENERATE_RAMDOM_COLOR_BASE_ON_TEXT(transaction?.fullName || "")}>
								<Heading size={"sm"} color={colors.white}>
									{EXTRACT_FIRST_LAST_INITIALS(transaction?.fullName || "0")}
								</Heading>
							</Avatar>
						}
						<VStack ml={"10px"} >
							<Heading textTransform={"capitalize"} fontSize={scale(20)} color={"white"}>{MAKE_FULL_NAME_SHORTEN(transaction?.fullName || "")}</Heading>
							<Text fontSize={scale(15)} color={colors.lightSkyGray}>{transaction?.username}</Text>
						</VStack>
					</HStack>
					<Pressable mb={"20px"} _pressed={{ opacity: 0.5 }} bg={colors.lightGray} onPress={handleShare} w={"40px"} h={"40px"} borderRadius={100} alignItems={"center"} justifyContent={"center"}>
						<Entypo name="share" size={20} color={colors.mainGreen} />
					</Pressable>
				</HStack>
				<VStack>
					<VStack mt={"10px"} alignItems={"center"}>
						<Heading textTransform={"capitalize"} fontSize={scale(34)} color={colors.white}>{FORMAT_CURRENCY(transaction?.amount)}</Heading>
						<Text color={colors.lightSkyGray}>{FORMAT_CREATED_DATE(transaction?.createdAt)}</Text>
						{transaction.isFromMe ? <VStack my={"15px"} textAlign={"center"} space={1} alignItems={"center"}>
							<StatuIcon status={transaction?.status || ""} />
							<VStack w={"80%"}>
								<Text textAlign={"center"} fontSize={scale(14)} color={colors.white}>{transactionStatus(transaction.status)}</Text>
							</VStack>
						</VStack> : null}
					</VStack>
				</VStack>
			</VStack>
			{showPayButton ?
				<VStack w={"100%"} borderRadius={15} alignItems={"center"}>
					<HStack w={"40px"} h={"40px"} bg={colors.lightGray} borderRadius={100} justifyContent={"center"} alignItems={"center"}>
						{account.balance < transaction.amount ?
							<AntDesign name="info" size={28} color={colors.red} />
							:
							<Ionicons name={"warning"} size={22} color={colors.warning} />
						}
					</HStack>
					<Text textAlign={"center"} w={"85%"} fontSize={scale(15)} color={colors.pureGray}>
						{account.balance < transaction.amount ?
							"No hay suficiente dinero en tu cuenta para pagar esta transacción." :
							"Responde solo a solicitudes de pago que conozcas con certeza para garantizar tu seguridad."
						}
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
							disabled={isCancelLoading || account.balance < transaction.amount}
							opacity={isCancelLoading || account.balance < transaction.amount ? 0.5 : 1}
							onPress={() => onPress(true)}
							spin={isPaying}
							w={showPayButton ? "49%" : "80%"}
							bg={account.balance > transaction.amount ? colors.mainGreen : colors.lightGray}
							color={account.balance > transaction.amount ? colors.white : colors.mainGreen}
							title={title}
						/>
					</HStack>
				</VStack>
				: transaction.isFromMe ?
					<VStack w={"100%"} justifyContent={"center"}>
						<HStack w={"85%"} mb={"10px"}>
							<Heading fontSize={scale(16)} textTransform={"capitalize"} color={"white"}>{transaction?.location?.fullArea || "Ubicación"}</Heading>
						</HStack>
						{transaction?.location?.uri ? <Image
							ref={imageRef}
							alt='fine-location-image-alt'
							resizeMode="cover"
							w={"100%"}
							h={height / 3.7}
							style={{
								borderRadius: 10
							}}
							source={{ uri: transaction?.location?.uri }}
						/> : null}
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
							<StatuIcon status={transaction?.status || ""} />
							<VStack w={"80%"}>
								<Text textAlign={"center"} fontSize={scale(16)} color={colors.white}>{transactionStatus(transaction.status)}</Text>
							</VStack>
							{transaction?.status === "suspicious" ? <HStack mt={"20px"}>
								<Button
									title='Contactanos'
									w={"80%"}
									onPress={async () => await onClose(true)}
									bg={colors.mainGreen}
									leftRender={<MaterialIcons name="phone" size={24} color="white" />}
								/>
							</HStack> : null}
						</VStack>
					</VStack>
			}
		</VStack>
	)
}

export default SingleSentTransaction
