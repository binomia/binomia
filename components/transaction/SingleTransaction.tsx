import React, { useState } from 'react'
import colors from '@/colors'
import DefaultIcon from 'react-native-default-icon';
import { StyleSheet, Dimensions, TouchableOpacity } from 'react-native'
import { Heading, Image, Text, VStack, FlatList, HStack, Stack, Pressable, ZStack } from 'native-base'
import { FORMAT_CURRENCY, GENERATE_RAMDOM_COLOR_BASE_ON_TEXT, MAKE_FULL_NAME_SHORTEN } from '@/helpers'
import { scale } from 'react-native-size-matters';
import BottomSheet from '@/components/global/BottomSheet';
import Ionicons from '@expo/vector-icons/Ionicons';
import Button from '@/components/global/Button';
import { useDispatch, useSelector } from 'react-redux';
import Entypo from '@expo/vector-icons/Entypo';
import * as Sharing from 'expo-sharing';
import moment from 'moment';
import { cancelIcon, checked, pendingClock } from '@/assets';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLazyQuery, useMutation } from '@apollo/client';
import { TransactionApolloQueries } from '@/apollo/query/transactionQuery';
import { AccountApolloQueries } from '@/apollo/query';
import { globalActions } from '@/redux/slices/globalSlice';
import { transactionActions } from '@/redux/slices/transactionSlice';
import { transactionStatus } from '@/mocks';


type Props = {
	title?: string
	goNext?: (_?: number) => void,
	showPayButton?: boolean
	iconImage?: any

}

const { height, width } = Dimensions.get('window')
const SingleTransaction: React.FC<Props> = ({ title = "Ver Detalles", iconImage, showPayButton = false, goNext = (_?: number) => { } }) => {
	const dispatch = useDispatch()
	const { transaction } = useSelector((state: any) => state.transactionReducer)
	const { account, user } = useSelector((state: any) => state.globalReducer)
	const [openDetail, setOpenDetail] = useState<boolean>(false)
	const [isLoading, setIsLoading] = useState<boolean>(false)
	const [isCancelLoading, setIsCancelLoading] = useState<boolean>(false)
	const [isCancelled, setIsCancelled] = useState<boolean>(false)
	const [payRequestTransaction] = useMutation(TransactionApolloQueries.payRequestTransaction());

	const details = [
		{
			title: "Fecha",
			value: moment(Number(transaction.createdAt)).format("lll")
		},
		{
			title: "Enviado a",
			value: transaction.fullName
		},
		{
			title: "Monto",
			value: transaction.amount
		}
	]

	const handleValue = (title: string, value: string) => {
		if (title === "Monto")
			return {
				title,
				value: FORMAT_CURRENCY(Number(value)),
				color: amountColor(transaction)
			}

		if (title === "Enviado a")
			return {
				title: transaction.isFromMe ? title : "Enviado por",
				value,
				color: colors.white
			}

		return {
			title,
			value,
			color: colors.white
		}
	}

	const handleShare = async () => {
		const isAvailableAsync = await Sharing.isAvailableAsync()
		if (!isAvailableAsync) return

		await Sharing.shareAsync("http://test.com")
	}

	const formatTransaction = (transaction: any) => {
		const isFromMe = transaction.from.user?.id === user.id

		const profileImageUrl = isFromMe ? transaction.to.user?.profileImageUrl : transaction.from.user?.profileImageUrl
		const fullName = isFromMe ? transaction.to.user?.fullName : transaction.from.user?.fullName
		const username = isFromMe ? transaction.from.user?.username : transaction.to.user?.username
		const showPayButton = transaction.transactionType === "request" && !isFromMe && transaction.status === "pending"
		const amountColor = (transaction.transactionType === "request" && isFromMe) ? colors.mainGreen : colors.red

		return {
			isFromMe,
			amountColor,
			profileImageUrl: profileImageUrl || "",
			amount: transaction.amount,
			showPayButton,
			fullName: fullName || "",
			username: username || ""
		}
	}

	const onPress = async (paymentApproved: boolean) => {
		if (transaction.showPayButton) {
			try {
				setIsCancelLoading(!paymentApproved)
				setIsLoading(paymentApproved)

				const { data } = await payRequestTransaction({
					variables: {
						transactionId: transaction.transactionId,
						paymentApproved
					}
				})

				await dispatch(transactionActions.setTransaction(Object.assign({}, transaction, { ...data.payRequestTransaction, ...formatTransaction(data.payRequestTransaction) })))
				await dispatch(globalActions.setAccount(Object.assign({}, account, { balance: Number(account.balance) - Number(transaction.amount) })))

				setIsLoading(false)
				setIsCancelLoading(false)
				setIsCancelled(paymentApproved)
				goNext(paymentApproved ? 1 : 2)

			} catch (error) {
				setIsLoading(false)
				console.log({ payRequestTransaction: error });
			}

		} else
			setOpenDetail(true)
	}


	const amountColor = (transaction: any) => {
		if (transaction.status === "cancelled")
			return colors.red

		if (transaction.status === "pending")
			return colors.pureGray

		return colors.mainGreen
	}


	return (
		<VStack h={"93%"}>
			<VStack h={"100%"} justifyContent={"space-between"}>
				<VStack>					
					<VStack pt={"50px"} alignItems={"center"} borderRadius={10}>
						<HStack>
							{transaction.profileImageUrl ?
								<Image borderRadius={100} resizeMode='contain' alt='logo-image' w={scale(width / 4)} h={scale(width / 4)} source={{ uri: transaction.profileImageUrl }} />
								:
								<DefaultIcon
									value={transaction?.fullName || ""}
									contentContainerStyle={[styles.contentContainerStyle, { width: scale(width / 4), height: scale(width / 4), backgroundColor: GENERATE_RAMDOM_COLOR_BASE_ON_TEXT(transaction?.fullName || "") }]}
									textStyle={styles.textStyle}
								/>
							}
						</HStack>
						<VStack mt={"10px"} ml={"10px"} alignItems={"center"} justifyContent={"center"}>
							<Heading textTransform={"capitalize"} fontSize={scale(25)} color={"white"}>{MAKE_FULL_NAME_SHORTEN(transaction?.fullName || "")}</Heading>
							<Text fontSize={scale(16)} color={colors.lightSkyGray}>{transaction.username}</Text>
						</VStack>
						<VStack mt={"40px"} alignItems={"center"}>
							<Heading textTransform={"capitalize"} fontSize={scale(40)} color={amountColor(transaction)}>{FORMAT_CURRENCY(transaction?.amount)}</Heading>
							<Text mb={"40px"} color={colors.lightSkyGray}>{moment(Number(transaction?.createdAt)).format("lll")}</Text>
							<ZStack w={scale(width / 6)} h={scale(width / 6)} borderRadius={100} justifyContent={"center"} alignItems={"center"} >
								<HStack w={"80%"} h={"80%"} bg={colors.white} borderRadius={100} />
								<Image borderRadius={100} p={"20px"} resizeMode='contain' alt='logo-image' w={scale(width / 6)} h={scale(width / 6)} source={iconImage} />
							</ZStack>
							<Text mt={"10px"} fontSize={scale(14)} fontWeight={"bold"} color={colors.white}>{transactionStatus(transaction.status)}</Text>
						</VStack>
					</VStack>
				</VStack>
				<HStack px={"20px"} justifyContent={showPayButton ? "space-between" : "center"}>
					{showPayButton ? <Button onPress={() => onPress(false)} spin={isCancelLoading} w={"49%"} bg={colors.lightGray} color={colors.red} title={"Cancelar"} /> : null}
					<Button onPress={() => onPress(true)} spin={isLoading} w={showPayButton ? "49%" : "80%"} bg={colors.mainGreen} color={colors.white} title={title} />
				</HStack>
			</VStack>
			<BottomSheet openTime={300} height={height * 0.45} onCloseFinish={() => setOpenDetail(false)} open={openDetail}>
				<VStack my={"30px"} alignItems={"center"}>
					<Image borderRadius={100} resizeMode='contain' alt='logo-image' w={scale(30)} h={scale(30)} source={iconImage} />
					<Heading mt={"10px"} textTransform={"capitalize"} fontSize={scale(15)} color={"white"}>{transactionStatus(transaction.status)}</Heading>
					<VStack px={"40px"} mt={"40px"} w={"100%"}>
						<FlatList
							data={details}
							renderItem={({ item, index }) => (
								<HStack key={`detail-tx-${index}`} mb={"10px"} w={"100%"} justifyContent={"space-between"} alignItems={"center"}>
									<Text fontSize={scale(14)} color={colors.white}>{handleValue(item.title, item.value).title}</Text>
									<Text fontSize={scale(14)} textTransform={"capitalize"} color={handleValue(item.title, item.value).color}>{handleValue(item.title, item.value).value}</Text>
								</HStack>
							)}
						/>
					</VStack>
					<Pressable mt={"20px"} _pressed={{ opacity: 0.5 }} bg={colors.mainGreen} onPress={handleShare} w={"70px"} h={"70px"} borderRadius={100} alignItems={"center"} justifyContent={"center"}>
						<Entypo name="share" size={28} color={colors.white} />
					</Pressable>
				</VStack>
			</BottomSheet>
		</VStack>
	)
}

export default SingleTransaction


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
	}
})