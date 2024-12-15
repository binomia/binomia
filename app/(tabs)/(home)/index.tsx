import React, { useCallback, useEffect, useState } from 'react'
import colors from '@/colors';
import Button from '@/components/global/Button';
import QRScannerScreen from '@/components/global/QRScanner';
import HomeSkeleton from '@/components/home/homeSkeleton';
import { Dimensions, RefreshControl } from 'react-native'
import { Heading, HStack, Image, Pressable, VStack, Text, ScrollView } from 'native-base';
import { bagIcon, bills, cars, house, phone, sendIcon } from '@/assets';
import { useLazyQuery } from '@apollo/client';
import { useDispatch, useSelector } from 'react-redux';
import { AccountApolloQueries } from '@/apollo/query';
import { globalActions } from '@/redux/slices/globalSlice';
import { FORMAT_CURRENCY } from '@/helpers';
import { scale } from 'react-native-size-matters';
import { router } from 'expo-router';
import Transactions from '@/components/transaction/transactions';


const { width } = Dimensions.get('window');
const HomeScreen: React.FC = () => {
	const { account } = useSelector((state: any) => state.globalReducer)
	const dispatch = useDispatch()

	const [showBottomSheet, setShowBottomSheet] = useState(false)
	const [getAccount] = useLazyQuery(AccountApolloQueries.account());

	const [refreshing, setRefreshing] = useState(false);
	const [isLoading, setIsLoading] = useState(true);

	const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

	const fetchAccount = async () => {
		try {
			const { data } = await getAccount()
			await dispatch(globalActions.setAccount(data.account))
		} catch (error) {
			console.log(error);
		}
	}

	const onRefresh = useCallback(async () => {
		try {
			setRefreshing(true);

			await fetchAccount();

			setTimeout(() => {
				setRefreshing(false);
			}, 1000);
		} catch (error) {
			console.log(error);
		}

	}, []);


	useEffect(() => {
		(async () => {
			if (Object.keys(account).length > 0) {
				await delay(1000)
				setIsLoading(false)

			} else {
				await fetchAccount();
				setIsLoading(false)
			}
		})()
	}, [])

	return (isLoading ? (<HomeSkeleton />) : (
		<VStack p={"20px"} w={width} bg={colors.darkGray} flex={1} alignItems={"center"}>
			<ScrollView showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
				<VStack w={"100%"} justifyContent={"center"} alignItems={"center"} borderRadius={"10px"}>
					<VStack bg={colors.lightGray} p={"20px"} w={"100%"} justifyContent={"space-between"} borderRadius={"10px"} h={scale(160)}>
						<VStack>
							<Heading size={"lg"} color={"white"}>Balance</Heading>
							<Heading fontSize={scale(28)} color={"white"}>{FORMAT_CURRENCY(account?.balance || 0)}</Heading>
						</VStack>
						<HStack w={"100%"} alignItems={"center"} justifyContent={"space-between"} >
							<Button
								leftRender={<Image resizeMode='contain' alt='send-image-icon' w={"18px"} h={"18px"} source={sendIcon} />}
								w={"49%"}
								bg={"darkGray"}
								mt={"20px"}
								borderRadius={"10px"}
								title="Enviar" onPress={() => router.navigate("/user")}
							/>
							<Button
								leftRender={<Image resizeMode='contain' alt='send-image-icon' w={"20px"} h={"20px"} source={bagIcon} />}
								w={"49%"}
								bg={"darkGray"}
								mt={"20px"}
								borderRadius={"10px"}
								title="Solicitar" onPress={() => router.navigate("/request")}
							/>
						</HStack>
					</VStack>
				</VStack>
				<VStack w={"100%"} pt={"30px"}>
					<Transactions showNewTransaction={false} />
				</VStack>
				{/* <VStack w={"100%"} pt={"30px"} px={"5px"}>
					<Heading fontSize={scale(24)} color={"white"}>Servicios</Heading>
					<HStack mt={"10px"} alignItems={"center"} justifyContent={"space-between"}>
						<Pressable onPress={() => { }} _pressed={{ opacity: 0.5 }} borderRadius={"10px"} bg={colors.lightGray} w={"49%"} h={scale(120)} justifyContent={"center"} alignItems={"center"}>
							<Image resizeMode='contain' alt='send-image-icon' w={scale(40)} h={scale(40)} source={phone} />
							<Text color={"white"}>Recargas</Text>
						</Pressable>
						<Pressable _pressed={{ opacity: 0.5 }} borderRadius={"10px"} bg={colors.lightGray} w={"49%"} h={scale(120)} justifyContent={"center"} alignItems={"center"}>
							<Image resizeMode='contain' alt='send-image-icon' w={scale(40)} h={scale(40)} source={cars} />
							<Text color={"white"}>Seguros</Text>
						</Pressable>
					</HStack>
					<HStack mt={"10px"} alignItems={"center"} justifyContent={"space-between"}>
						<Pressable _pressed={{ opacity: 0.5 }} borderRadius={"10px"} bg={colors.lightGray} w={"49%"} h={scale(120)} justifyContent={"center"} alignItems={"center"}>
							<Image resizeMode='contain' alt='send-image-icon' w={scale(40)} h={scale(40)} source={house} />
							<Text color={"white"}>Electricidad</Text>
						</Pressable>
						<Pressable _pressed={{ opacity: 0.5 }} borderRadius={"10px"} bg={colors.lightGray} w={"49%"} h={scale(120)} justifyContent={"center"} alignItems={"center"}>
							<Image resizeMode='contain' alt='send-image-icon' w={scale(40)} h={scale(40)} source={bills} />
							<Text color={"white"}>Facturas</Text>
						</Pressable>
					</HStack>
				</VStack> */}
				<QRScannerScreen defaultPage={1} open={showBottomSheet} onCloseFinish={() => setShowBottomSheet(false)} />
			</ScrollView>
		</VStack>
	))
}

export default HomeScreen
