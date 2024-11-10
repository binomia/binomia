import React, { useState } from 'react'
import colors from '@/colors'
import DefaultIcon from 'react-native-default-icon';
import { StyleSheet, SafeAreaView, Dimensions } from 'react-native'
import { Heading, Image, Text, VStack, FlatList, HStack, Stack, Pressable } from 'native-base'
import { FORMAT_CURRENCY, GENERATE_RAMDOM_COLOR_BASE_ON_TEXT, MAKE_FULL_NAME_SHORTEN } from '@/helpers'
import { scale } from 'react-native-size-matters';
import BottomSheet from '@/components/global/BottomSheet';
import Ionicons from '@expo/vector-icons/Ionicons';
import Button from '@/components/global/Button';
import { useSelector } from 'react-redux';
import Entypo from '@expo/vector-icons/Entypo';
import * as Sharing from 'expo-sharing';
import moment from 'moment';
import { checked } from '@/assets';
import { AntDesign } from '@expo/vector-icons';


type Props = {
	onClose?: () => void
}

const { height } = Dimensions.get('window')
const SingleTransactionBanking: React.FC<Props> = ({ onClose = (_: boolean) => { } }) => {
	const { transaction } = useSelector((state: any) => state.transactionReducer)
	const { card } = useSelector((state: any) => state.globalReducer)
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
			<VStack px={"10px"} h={"100%"}>
				<VStack flex={1} pb={"40px"} justifyContent={"space-between"}>
					<Pressable onPress={() => {}} _pressed={{ opacity: 0.5 }} flexDirection={"row"} alignItems={"center"}>
						<Image mr={"10px"} borderRadius={100} resizeMode='contain' alt='logo-image' w={scale(40)} h={scale(40)} source={{ uri: card?.logo }} />
						<VStack justifyContent={"center"}>
							<Heading textTransform={"capitalize"} fontSize={scale(13)} color={"white"}>{card?.brand} {card?.last4Digits}</Heading>
							<Text fontSize={scale(13)} color={colors.pureGray}>{card?.bankName}</Text>
						</VStack>
						<Ionicons style={{ marginBottom: 20 }} name="chevron-forward" size={25} color={colors.gray} />
					</Pressable>
					<VStack mt={"50px"} alignItems={"center"} borderRadius={10}>
						<VStack mt={"10px"} mb={"50px"} ml={"10px"} alignItems={"center"} justifyContent={"center"}>
							<Heading textTransform={"capitalize"} fontSize={scale(25)} color={"white"}>{transaction.transactionType}</Heading>
						</VStack>
						<VStack alignItems={"center"}>
							<Heading textTransform={"capitalize"} fontSize={scale(40)} color={transaction.isFromMe ? "red" : "mainGreen"}>{transaction.isFromMe ? "-" : "+"}{FORMAT_CURRENCY(transaction?.amount)}</Heading>
							<Text mb={"20px"} color={colors.lightSkyGray}>{moment(Number(transaction?.createdAt)).format("lll")}</Text>
							{/* <Image borderRadius={100} resizeMode='contain' alt='logo-image' w={scale(70)} h={scale(70)} source={checked} /> */}
							<HStack w={scale(60)} h={scale(60)} alignItems={"center"} justifyContent={"center"} borderRadius={100} bg={colors.lightGray}>
								<AntDesign name={transaction.icon as any} size={24} color={transaction.isDeposit ? colors.mainGreen : colors.red} />
							</HStack>
							{/* <Heading textTransform={"capitalize"} fontSize={scale(18)} color={"white"}>{transaction.transactionType}</Heading> */}
						</VStack>
					</VStack>
					{/* <HStack justifyContent={"center"}>
						<Button onPress={() => setOpenDetail(true)} w={"80%"} bg={"mainGreen"} color='white' title={"Ver Detalles"} />
					</HStack> */}
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