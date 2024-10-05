import React, { useEffect, useState } from 'react'
import colors from '@/colors'
import Input from '@/components/global/Input'
import DefaultIcon from 'react-native-default-icon';
import { StyleSheet, SafeAreaView, Keyboard, Dimensions, TouchableWithoutFeedback, TouchableOpacity } from 'react-native'
import { Heading, Image, Text, VStack, FlatList, HStack, Stack, Pressable, ScrollView } from 'native-base'
import { useLazyQuery } from '@apollo/client'
import { UserApolloQueries } from '@/apollo/query'
import { UserAuthSchema } from '@/auth/userAuth'
import { z } from 'zod'
import { FORMAT_CURRENCY, FORMAT_DATE, GENERATE_RAMDOM_COLOR_BASE_ON_TEXT, MAKE_FULL_NAME_SHORTEN } from '@/helpers'
import { useSqlite } from '@/hooks/useSqlite';
import { scale } from 'react-native-size-matters';
import BottomSheet from '@/components/global/BottomSheet';
import Ionicons from '@expo/vector-icons/Ionicons';
import Button from '@/components/global/Button';
import { useDispatch, useSelector } from 'react-redux';
import moment from 'moment';
import AntDesign from '@expo/vector-icons/AntDesign';
import { useNavigation } from '@react-navigation/native';
import SingleTransactionScreen from './SingleTransactionScreen';
import SendTransaction from '@/components/transaction/SendTransaction';
import KeyNumberPad from '@/components/global/KeyNumberPad';
import { transactionActions } from '@/redux/slices/transactionSlice';

const { height, width } = Dimensions.get('window')
const TransactionsScreen: React.FC = () => {
	const dispatch = useDispatch()
	const navigation = useNavigation<any>();

	const [searchUser] = useLazyQuery(UserApolloQueries.searchUser())
	const { getSearchedUsers, insertSearchedUser, deleteSearchedUser } = useSqlite()

	const [users, setUsers] = useState<z.infer<typeof UserAuthSchema.searchUserData>>([])
	const [showKeyboard, setShowKeyboard] = useState<boolean>(false);
	const [showSendTransaction, setShowSendTransaction] = useState<boolean>(false);


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

				if (data.searchUsers.length > 0) {
					data.searchUsers.forEach(async (user: any) => {
						// await deleteSearchedUser(user.id) rosa elena victoriano severino
						await insertSearchedUser(user)
					})
				}
			}

		} catch (error) {
			console.log(error)
		}
	}

	const fetchSearchedUser = async () => {
		const searchedUsers = await getSearchedUsers()
		setUsers(searchedUsers)
	}

	const onSelectUser = async (user: z.infer<typeof UserAuthSchema.singleSearchUserData>) => {
		await dispatch(transactionActions.setReceiver(user))
		setShowSendTransaction(true)
	}

	const onCloseFinish = () => {
		setShowSendTransaction(false)
	}


	useEffect(() => {
		fetchSearchedUser()
	}, [])

	return (
		<TouchableWithoutFeedback onPress={Keyboard.dismiss}>
			<SafeAreaView style={{ flex: 1, backgroundColor: colors.darkGray }}>
				<VStack pt={"20px"}>
					<VStack px={"20px"} w={"100%"} alignItems={"center"}>
						<Input h={"50px"} w={"100%"} placeholder='Buscar...' onChangeText={(value) => handleSearch(value.toLowerCase())} />
					</VStack>
					<ScrollView px={"20px"} mb={"40px"} horizontal contentContainerStyle={styles.ScrollView} >
						<VStack mr={"20px"} width={"70px"} height={"70px"} justifyContent={"center"} alignItems={"center"}>
							<Pressable _pressed={{ opacity: 0.5 }} bg={colors.lightGray} borderRadius={100} width={"70px"} height={"70px"} alignItems={"center"} justifyContent={"center"} onPress={() => navigation.navigate("SearchUserScreen")}>
								<AntDesign name="pluscircle" size={24} color="white" />
							</Pressable>
							<Heading textTransform={"capitalize"} fontSize={scale(10)} color={"white"}>Nueva</Heading>
						</VStack>
						<FlatList
							scrollEnabled={false}
							showsVerticalScrollIndicator={true}
							data={users}
							contentContainerStyle={{ flexDirection: "row", gap: 20, }}
							renderItem={({ item, index }) => (
								<Pressable _pressed={{ opacity: 0.5 }} borderRadius={100} alignItems={"center"} key={`search_user_${index}-${item.username}`} onPress={() => onSelectUser(item)}>
									<VStack alignItems={"center"} borderRadius={10}>
										{item.profileImageUrl ?
											<Image borderRadius={100} resizeMode='contain' alt='logo-image' w={"50px"} h={"50px"} source={{ uri: item.profileImageUrl }} />
											:
											<DefaultIcon
												value={item.fullName}
												contentContainerStyle={[styles.contentContainerStyle, { width: 70, height: 70, backgroundColor: GENERATE_RAMDOM_COLOR_BASE_ON_TEXT(item.fullName) }]}
												textStyle={styles.textStyle}
											/>
										}
										<VStack justifyContent={"center"}>
											<Heading textTransform={"capitalize"} fontSize={scale(10)} color={"white"}>{item.fullName.slice(0, 7)}...</Heading>
										</VStack>
									</VStack>
								</Pressable>

							)}
						/>
					</ScrollView>
					<Heading px={"20px"} fontSize={scale(20)} color={"white"}>Transacciones</Heading>
					<FlatList
						px={"20px"}
						h={"100%"}
						mt={"10px"}
						data={users}
						renderItem={({ item, index }) => (
							<TouchableOpacity key={`search_user_${index}-${item.username}`} onPress={() => setShowKeyboard(true)}>
								<HStack alignItems={"center"} justifyContent={"space-between"} my={"10px"} borderRadius={10}>
									<HStack>
										{item.profileImageUrl ?
											<Image borderRadius={100} resizeMode='contain' alt='logo-image' w={"50px"} h={"50px"} source={{ uri: item.profileImageUrl }} />
											:
											<DefaultIcon
												value={item.fullName}
												contentContainerStyle={[styles.contentContainerStyle, { backgroundColor: GENERATE_RAMDOM_COLOR_BASE_ON_TEXT(item.fullName) }]}
												textStyle={styles.textStyle}
											/>
										}
										<VStack ml={"10px"} justifyContent={"center"}>
											<Heading textTransform={"capitalize"} fontSize={scale(15)} color={"white"}>{MAKE_FULL_NAME_SHORTEN(item.fullName)}</Heading>
											<Text color={colors.lightSkyGray}>{moment("2024-01-01").format("lll")}</Text>
										</VStack>
									</HStack>
									<VStack ml={"10px"} justifyContent={"center"}>
										<Heading fontWeight={"semibold"} textTransform={"capitalize"} fontSize={scale(14)} color={index % 2 === 0 ? "mainGreen" : "red"}>-{FORMAT_CURRENCY(200)}</Heading>
									</VStack>
								</HStack>
							</TouchableOpacity>
						)}
					/>
					<BottomSheet openTime={300} height={height} onCloseFinish={onCloseFinish} open={showKeyboard}>
						<SingleTransactionScreen onClose={onCloseFinish} />
					</BottomSheet>
					<SendTransaction open={showSendTransaction} onCloseFinish={onCloseFinish} onSendFinish={() => {

					}} />
				</VStack>
			</SafeAreaView>
		</TouchableWithoutFeedback>
	)
}

export default TransactionsScreen


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
	},
	ScrollView: {
		flexDirection: "row",
		alignItems: "center",
		height: 100,
		marginTop: 15,
		marginBottom: 40
	}
}) 