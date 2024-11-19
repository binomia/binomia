import React, { useState } from 'react'
import colors from '@/colors'
import BottomSheet from '@/components/global/BottomSheet';
import moment from 'moment';
import { StyleSheet, SafeAreaView, Dimensions } from 'react-native'
import { Heading, Image, Text, VStack, FlatList, HStack, Pressable, Stack } from 'native-base'
import { FORMAT_CURRENCY } from '@/helpers'
import { scale } from 'react-native-size-matters';
import { useSelector } from 'react-redux';
import { checked, mastercardLogo, visaLogo } from '@/assets';
import { AntDesign, Entypo } from '@expo/vector-icons';
import { TEXT_HEADING_FONT_SIZE } from '@/constants';
import * as Sharing from 'expo-sharing';


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

	const renderCardLogo = (brand: string) => {
		switch (brand) {
			case "visa":
				return <Image alt='logo-image' mr={"10px"} resizeMode='contain' w={"50px"} h={"50px"} source={visaLogo} />

			case "mastercard":
				return <Image alt='logo-image' mr={"10px"} resizeMode='contain' w={"50px"} h={"50px"} source={mastercardLogo} />

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


	return (
		<SafeAreaView style={{ flex: 1, backgroundColor: colors.darkGray }}>
			<VStack px={"20px"} h={"100%"}>
				<VStack flex={1} pb={"40px"} my={"20px"} justifyContent={"space-between"}>
					<HStack >
						{renderCardLogo(transaction.card.brand)}
						<VStack justifyContent={"center"}>
							<Heading textTransform={"capitalize"} fontSize={scale(13)} color={"white"}>{transaction.card?.brand} {transaction.card?.last4Number}</Heading>
							<Text fontSize={scale(13)} color={colors.pureGray}>{transaction.card?.alias}</Text>
						</VStack>
					</HStack>
					<VStack alignItems={"center"} borderRadius={10}>
						<VStack mt={"10px"} mb={"10px"} ml={"10px"} alignItems={"center"} justifyContent={"center"}>
							<Heading textTransform={"capitalize"} fontSize={scale(20)} color={"white"}>{transaction.transactionType}</Heading>
						</VStack>
						<VStack alignItems={"center"}>
							<Heading textTransform={"capitalize"} fontSize={scale(TEXT_HEADING_FONT_SIZE)} color={!transaction.isDeposit ? "red" : "mainGreen"}>{!transaction.isDeposit ? "-" : "+"}{FORMAT_CURRENCY(transaction?.amount)}</Heading>
							<Text mb={"20px"} color={colors.lightSkyGray}>{moment(Number(transaction?.createdAt)).format("lll")}</Text>
							<Pressable  onPress={handleShare} _pressed={{ opacity: 0.5 }}  w={scale(60)} h={scale(60)} shadow={1} borderWidth={0.4} borderColor={colors.placeholder} alignItems={"center"} justifyContent={"center"}  borderRadius={100} bg={colors.lightGray}>
								<Entypo name="share" size={24} color="white" />
							</Pressable>
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


const styles = StyleSheet.create({
	Shadow: {
		shadowColor: colors.lightGray,
		shadowOffset: {
			width: 5,
			height: 1,
		},
		shadowOpacity: 0.25,
		shadowRadius: 1,
		elevation: 1,
	},
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