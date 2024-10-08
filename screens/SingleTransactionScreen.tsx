import React, { useEffect, useState } from 'react'
import colors from '@/colors'
import DefaultIcon from 'react-native-default-icon';
import { StyleSheet, SafeAreaView, Dimensions, TouchableOpacity } from 'react-native'
import { Heading, Image, Text, VStack, FlatList, HStack, Stack } from 'native-base'
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


type Props = {
	onClose?: () => void
}

const { height } = Dimensions.get('window')
const SingleTransactionScreen: React.FC<Props> = ({ onClose = (_: boolean) => { } }) => {
	const { transaction } = useSelector((state: any) => state.transactionReducer)
	const [openDetail, setOpenDetail] = useState<boolean>(false)


	const details = [
		// {
		// 	title: "id",
		// 	value: transaction.id
		// },
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
		switch (title) {
			case "Monto":
				return {
					title,
 					value: transaction.isFromMe ? "-" : "+" + FORMAT_CURRENCY(Number(value)),
					color: colors.mainGreen
				}

			default:
				return {
					title,
					value,
					color: colors.white
				}
		}
	}

	useEffect(() => {
		console.log(JSON.stringify(transaction, null, 2));

	}, [transaction])

	return (
		<SafeAreaView style={{ flex: 1, backgroundColor: colors.darkGray }}>
			<VStack px={"10px"} pt={"20px"} h={"100%"}>
				<HStack px={"10px"} justifyContent={"space-between"}>
					<TouchableOpacity onPress={() => onClose(false)}>
						<Stack w={"50px"}>
							<Ionicons name="chevron-back-outline" size={30} color="white" />
						</Stack>
					</TouchableOpacity>
					<Stack>
						<Heading mb={"20px"} size={"sm"} color={colors.white} textAlign={"center"}>Transaccion</Heading>
					</Stack>
					<TouchableOpacity onPress={() => Sharing.shareAsync("test", {
						mimeType: 'text/plain',
					})}>
						<Stack w={"50px"} alignItems={"center"} justifyContent={"center"}>
							<Entypo name="share" size={24} color="white" />
						</Stack>
					</TouchableOpacity>
				</HStack>
				<VStack flex={1} pb={"40px"} justifyContent={"space-between"}>
					<VStack mt={"50px"} alignItems={"center"} borderRadius={10}>
						<HStack>
							{transaction.profileImageUrl ?
								<Image borderRadius={100} resizeMode='contain' alt='logo-image' w={"50px"} h={"50px"} source={{ uri: transaction.profileImageUrl }} />
								:
								<DefaultIcon
									value={transaction?.fullName || ""}
									contentContainerStyle={[styles.contentContainerStyle, { width: 70, height: 70, backgroundColor: GENERATE_RAMDOM_COLOR_BASE_ON_TEXT(transaction?.fullName || "") }]}
									textStyle={styles.textStyle}
								/>
							}
						</HStack>
						<VStack mt={"10px"} ml={"10px"} alignItems={"center"} justifyContent={"center"}>
							<Heading textTransform={"capitalize"} fontSize={scale(15)} color={"white"}>{MAKE_FULL_NAME_SHORTEN(transaction?.fullName || "")}</Heading>
							<Text color={colors.lightSkyGray}>{transaction.username}</Text>
						</VStack>
					</VStack>
					<VStack mb={"50px"} alignItems={"center"}>
						<Heading textTransform={"capitalize"} fontSize={scale(40)} color={transaction.isFromMe ? "red" : "mainGreen"}>{transaction.isFromMe ? "-" : "+"}{FORMAT_CURRENCY(transaction?.amount)}</Heading>
						<Text mb={"10px"} color={colors.lightSkyGray}>{moment(Number(transaction?.createdAt)).format("lll")}</Text>
						<Image borderRadius={100} resizeMode='contain' alt='logo-image' w={scale(60)} h={scale(60)} source={checked} />
					</VStack>
					<HStack justifyContent={"center"}>
						<Button onPress={() => setOpenDetail(true)} w={"80%"} bg={"mainGreen"} color='white' title={"Ver Detalles"} />
					</HStack>
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

export default SingleTransactionScreen


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