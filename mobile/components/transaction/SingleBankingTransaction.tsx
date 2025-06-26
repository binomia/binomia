import React, { useState } from 'react'
import colors from '@/colors'
import BottomSheet from '@/components/global/BottomSheet';
import moment from 'moment';
import * as Sharing from 'expo-sharing';
import { SafeAreaView, Dimensions } from 'react-native'
import { Heading, Image, Text, VStack, FlatList, HStack, Pressable, ZStack } from 'native-base'
import { FORMAT_CREATED_DATE, FORMAT_CURRENCY } from '@/helpers'
import { scale } from 'react-native-size-matters';
import { useSelector } from 'react-redux';
import { americanExpressLogo, cancelIcon, checked, jcbLogo, mastercardLogo, pendingClock, suspicious, visaLogo } from '@/assets';
import { Entypo } from '@expo/vector-icons';
import { TEXT_HEADING_FONT_SIZE } from '@/constants';
import { transactionStatus } from '@/mocks';


type Props = {
	onClose?: () => void
}

const { height } = Dimensions.get('window')
const SingleTransactionBanking: React.FC<Props> = ({ }) => {
	const { transaction } = useSelector((state: any) => state.transactionReducer)
	const [openDetail, setOpenDetail] = useState<boolean>(false)


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

	const RenderCardLogo: React.FC<{ brand: string }> = ({ brand }: { brand: string }) => {
		switch (brand) {
			case "visa":
				return <Image alt='logo-image' mr={"10px"} resizeMode='contain' w={"50px"} h={"50px"} source={visaLogo} />

			case "mastercard":
				return <Image alt='logo-image' mr={"10px"} resizeMode='contain' w={"50px"} h={"50px"} source={mastercardLogo} />

			case "american-express":
				return <Image alt='logo-image' mr={"10px"} resizeMode='contain' w={"50px"} h={"50px"} source={americanExpressLogo} />

			case "jcb":
				return <Image alt='logo-image' mr={"10px"} resizeMode='contain' w={"50px"} h={"50px"} source={jcbLogo} />

			default:
				return null
		}
	}


	const handleValue = (title: string, value: string) => {
		if (title === "Monto")
			return {
				title,
				value: transaction.isFromMe ? "-" + FORMAT_CURRENCY(Number(value)) : "+" + FORMAT_CURRENCY(Number(value)),
				color: transaction.isFromMe ? colors.red : colors.mainGreen
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

		} else if (status === "pending" || status === "created") {
			return (
				<ZStack w={"35px"} h={"35px"} borderRadius={100} justifyContent={"center"} alignItems={"center"} >
					<HStack w={"80%"} h={"80%"} bg={colors.gray} borderRadius={100} />
					<Image borderRadius={100} alt='logo-image' w={"100%"} h={"100%"} source={pendingClock} />
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
		<SafeAreaView style={{ flex: 1, backgroundColor: colors.darkGray }}>
			<VStack px={"20px"} h={"100%"}>
				<VStack flex={1} pb={"40px"} my={"20px"} >
					<HStack justifyContent={"space-between"} alignItems={"center"}>
						<HStack>
							<RenderCardLogo brand={transaction.card.brand} />
							<VStack justifyContent={"center"}>
								<Heading textTransform={"capitalize"} fontSize={scale(13)} color={"white"}>{transaction.card?.brand} {transaction.card?.last4Number}</Heading>
								<Text fontSize={scale(13)} color={colors.pureGray}>{transaction.card?.alias}</Text>
							</VStack>
						</HStack>
						<Pressable onPress={handleShare} _pressed={{ opacity: 0.5 }} w={scale(35)} h={scale(35)} shadow={1} borderWidth={0.4} borderColor={colors.placeholder} alignItems={"center"} justifyContent={"center"} borderRadius={100} bg={colors.lightGray}>
							<Entypo name="share" size={24} color={colors.mainGreen} />
						</Pressable>
					</HStack>
					<VStack mt={"30px"}borderRadius={10}>
						<VStack alignItems={"center"} justifyContent={"space-between"} h={"95%"}>
							<VStack>
								<Heading textTransform={"capitalize"} fontSize={scale(TEXT_HEADING_FONT_SIZE)} color={!transaction.isDeposit ? "red" : "mainGreen"}>{FORMAT_CURRENCY(transaction?.amount)}</Heading>
								<Text mb={"20px"} color={colors.lightSkyGray}>{FORMAT_CREATED_DATE(transaction?.createdAt)}</Text>
							</VStack>
							<VStack alignItems={"center"} w={"80%"}>
								<StatuIcon status={transaction?.status || ""} />
								<Text textAlign={"center"} fontSize={scale(16)} color={colors.white}>{transactionStatus(transaction.status)}</Text>
							</VStack>
						</VStack>
					</VStack>
				</VStack>
				<BottomSheet openTime={300} height={height * 0.45} onCloseFinish={() => setOpenDetail(false)} open={openDetail}>
					<VStack my={"30px"} alignItems={"center"}>
						<Image borderRadius={100} resizeMode='contain' alt='logo-image' w={scale(30)} h={scale(30)} source={checked} />
						<Heading mt={"10px"} textTransform={"capitalize"} fontSize={scale(15)} color={"white"}>{"Completada"}</Heading>
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
					</VStack>
				</BottomSheet>
			</VStack>
		</SafeAreaView>
	)
}

export default SingleTransactionBanking
