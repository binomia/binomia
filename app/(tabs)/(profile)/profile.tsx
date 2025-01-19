import { StyleSheet, } from 'react-native'
import React, { useContext, useEffect, useState } from 'react'
import { Heading, Image, VStack, Text, HStack, Divider, FlatList, Pressable, ZStack, Spinner, ScrollView } from 'native-base'
import DefaultIcon from 'react-native-default-icon'
import { useDispatch, useSelector } from 'react-redux'
import { GENERATE_RAMDOM_COLOR_BASE_ON_TEXT, MAKE_FULL_NAME_SHORTEN } from '@/helpers'
import colors from '@/colors'
import { scale } from 'react-native-size-matters'
import Feather from '@expo/vector-icons/Feather';
import Button from '@/components/global/Button'
import { SessionContext } from '@/contexts/sessionContext'
import { useNavigation } from '@react-navigation/native'
import Fontisto from '@expo/vector-icons/Fontisto';
import * as ImagePicker from 'expo-image-picker';
import { useCloudinary } from '@/hooks/useCloudinary'
import { useMutation } from '@apollo/client'
import { UserApolloQueries } from '@/apollo/query'
import { globalActions } from '@/redux/slices/globalSlice'
import { profileScreenData } from '@/mocks'
import ImageView from "react-native-image-viewing";
import { router } from 'expo-router'
import { qrIcon } from '@/assets'
import QRScanner from '@/components/global/QRScanner'
import { accountActions } from '@/redux/slices/accountSlice'


const ProfileScreen: React.FC = () => {
	const { onLogout } = useContext(SessionContext)

	const dispatch = useDispatch()
	const { user } = useSelector((state: any) => state.accountReducer)

	const [showBottomSheet, setShowBottomSheet] = useState(false)
	const { uploadImage } = useCloudinary()
	const [profileImage, setProfileImage] = useState<string | null>(null)
	const [isLoading, setIsLoading] = useState<boolean>(false)
	const [updateUser] = useMutation(UserApolloQueries.updateUser())
	const [visible, setIsVisible] = useState(false);
	const [previewImage, setPreviewImage] = useState<string | null>(null);


	const pickImage = async () => {
		const result = await ImagePicker.launchImageLibraryAsync({
			mediaTypes: ImagePicker.MediaTypeOptions.Images,
			allowsEditing: true,
			aspect: [4, 3],
			quality: 1,
		});
		if (!result.canceled) {
			setIsLoading(true)
			const url = await uploadImage(result.assets[0].uri)
			const updatedUser = await updateUser({
				variables: {
					data: {
						profileImageUrl: url
					}
				}
			})

			await dispatch(accountActions.setUser(updatedUser.data.updateUser))

			setProfileImage(url);
			setIsLoading(false)
		}
	};

	const onOpenPreviewImage = () => {
		setIsVisible(true);
		setPreviewImage(profileImage)
	};
	const onClosePreviewImage = () => {
		setIsVisible(false);
		setPreviewImage(null)
	};

	useEffect(() => {
		setProfileImage(user?.profileImageUrl || null)
	}, [])


	return (
		<>
			<ScrollView contentContainerStyle={{ height: "100%" }} bg={colors.darkGray}>
				<VStack px={"20px"} justifyContent={"space-between"} h={"100%"}>
					<VStack>
						<HStack p={"20px"} bg={colors.lightGray} borderRadius={"15px"} justifyContent={"space-between"} alignItems={"center"} w={"100%"}>
							<HStack>
								<ZStack w={scale(80)} h={scale(80)} borderRadius={100} justifyContent={"center"}>
									{profileImage ?
										<Pressable w={scale(70)} h={scale(70)} borderRadius={100} onPress={() => onOpenPreviewImage()} _pressed={{ opacity: 0.5 }}>
											<Image borderRadius={100} resizeMode='contain' alt='logo-image' w={"100%"} h={"100%"} source={{ uri: profileImage }} />
										</Pressable>
										:
										<Pressable onPress={() => pickImage()} _pressed={{ opacity: 0.5 }}>
											<DefaultIcon
												value={user?.fullName}
												contentContainerStyle={[styles.contentContainerStyle, { width: scale(80), height: scale(80), backgroundColor: GENERATE_RAMDOM_COLOR_BASE_ON_TEXT(user?.fullName || "") }]}
												textStyle={styles.textStyle}
											/>
										</Pressable>
									}
									<HStack w={"90%"} justifyContent={"flex-end"} bottom={0}>
										<Pressable onPress={() => pickImage()} _pressed={{ opacity: 0.5 }} w={"30px"} h={"30px"} borderRadius={100} bg={colors.lightGray} justifyContent={"center"} alignItems={"center"}>
											<Fontisto name="camera" size={14} color="white" />
										</Pressable>
									</HStack>
									{isLoading ?
										<HStack pl={"10px"} pt={"10px"} justifyContent={"center"} alignItems={"center"} w={scale(90)} h={scale(90)}>
											<Spinner size={"lg"} color={colors.mainGreen} />
										</HStack>
										: null
									}
								</ZStack>
								<VStack justifyContent={"center"}>
									<Heading textTransform={"capitalize"} fontSize={scale(20)} color={"white"}>{MAKE_FULL_NAME_SHORTEN(user?.fullName || "")}</Heading>
									<Text fontSize={scale(14)} color={colors.lightSkyGray}>{user?.username}</Text>
								</VStack>
							</HStack>
							<Pressable onPress={() => setShowBottomSheet(true)} w={"60px"} h={"60px"} bg={colors.darkGray} borderRadius={100} justifyContent={"center"} alignItems={"center"}>
								<Image alt='logo-image' tintColor={colors.mainGreen} resizeMode='contain' w={"25px"} h={"25px"} source={qrIcon} />
							</Pressable>
						</HStack>
						<Heading mt={"50px"} mb={"10px"} textTransform={"capitalize"} fontSize={scale(20)} color={"white"}>Configuraciónes</Heading>
						<VStack borderRadius={10} w={"100%"} space={2} h={"auto"}>
							{profileScreenData.slice(0, 6).map((item) => (
								<Pressable _pressed={{ opacity: 0.5 }} flexDirection={"row"} w={"100%"} h={scale(45)} justifyContent={"space-between"} alignItems={"center"} onPress={() => router.navigate(item.path)}>
									<HStack alignItems={"center"}>
										<Image alt='logo-image' borderRadius={100} resizeMode='contain' w={scale(35)} h={scale(35)} source={item.icon} />
										<Heading ml={"10px"} fontSize={scale(15)} textTransform={"capitalize"} color={colors.white}>{item.name}</Heading>
									</HStack>
									<HStack w={"35px"} h={"35px"} borderRadius={10} bg={colors.lightGray} justifyContent={"center"} alignItems={"center"}>
										<Feather name="chevron-right" size={28} color="white" />
									</HStack>
								</Pressable>
							))}
						</VStack>
					</VStack>
					<HStack mb={"30px"} justifyContent={"center"}>
						<Button fontWeight={"bold"} bg={"lightGray"} color='red' title='Cerrar Sesion' onPress={onLogout} w={'80%'} />
					</HStack>
				</VStack>
				{previewImage ?
					<ImageView
						images={[{ uri: previewImage }]}
						imageIndex={0}
						visible={visible}
						onRequestClose={onClosePreviewImage}
					/>
					: null
				}

			</ScrollView>
			<QRScanner open={showBottomSheet} onCloseFinish={() => setShowBottomSheet(false)} />
		</>
	)
}

export default ProfileScreen


const styles = StyleSheet.create({
	contentContainerStyle: {
		width: 55,
		height: 55,
		borderRadius: 100
	},
	textStyle: {
		fontSize: 50,
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