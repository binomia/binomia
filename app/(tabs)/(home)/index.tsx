import React, { useCallback, useEffect, useState } from 'react'
import colors from '@/colors';
import Button from '@/components/global/Button';
import QRScannerScreen from '@/components/global/QRScanner';
import HomeSkeleton from '@/components/home/homeSkeleton';
import { Alert, Dimensions, RefreshControl } from 'react-native'
import { Heading, HStack, Image, Pressable, VStack, Text, ScrollView } from 'native-base';
import { bagIcon, bills, cars, house, phone, sendIcon } from '@/assets';
import { useLazyQuery } from '@apollo/client';
import { useDispatch, useSelector } from 'react-redux';
import { AccountApolloQueries } from '@/apollo/query';
import { globalActions } from '@/redux/slices/globalSlice';
import { FORMAT_CURRENCY } from '@/helpers';
import { scale } from 'react-native-size-matters';
import { router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';

import RecentTransactions from '@/components/transaction/RecentTransactions';
import { fetchRecentTopUps, fetchRecentTransactions } from '@/redux/fetchHelper';
import { accountActions } from '@/redux/slices/accountSlice';

const { width } = Dimensions.get('window');
const HomeScreen: React.FC = () => {
	const { account } = useSelector((state: any) => state.accountReducer)
	const dispatch = useDispatch()

	const [showBottomSheet, setShowBottomSheet] = useState(false)
	const [getAccount] = useLazyQuery(AccountApolloQueries.account());

	const [refreshing, setRefreshing] = useState(false);
	const [isLoading, setIsLoading] = useState(true);


	const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

	const fetchAccount = async () => {
		try {
			const { data } = await getAccount()
			await dispatch(accountActions.setAccount(data.account))
		} catch (error) {
			console.log(error);
		}
	}

	const onRefresh = useCallback(async () => {
		try {
			setRefreshing(true);

			await fetchAccount();
			await dispatch(fetchRecentTransactions());
			await dispatch(fetchRecentTopUps());

			setTimeout(() => {
				setRefreshing(false);
			}, 1000);
		} catch (error) {
			console.log(error);
		}

	}, []);


	useEffect(() => {
		(async () => {
			await dispatch(fetchRecentTransactions());

			if (Object.keys(account).length > 0) {
				await delay(1000)
				setIsLoading(false)

			} else {
				await fetchAccount();
				setIsLoading(false)
			}
		})()
	}, [])

	const handleAlert = () => {
		Alert.alert('Envio De Dinero', 'La opción de enviar dinero está desactivada.', [
			{
				text: 'Cancelar',
				onPress: () => { },
				style: 'destructive',
			},
			{
				text: 'Activar',
				onPress: () => router.navigate("/privacy"),
			}
		])
	}

	const services = [
		{
			id: 0,
			name: "Recargas",
			image: phone,
			onPress: () => router.navigate("/topups")
		},
		{
			id: 1,
			name: "Seguros",
			image: cars,
			onPress: () => { }
		},
		{
			id: 2,
			name: "Electricidad",
			image: house,
			onPress: () => { }
		},
		{
			id: 3,
			name: "Facturas",
			image: bills,
			onPress: () => { }
		}
	]

	return (isLoading ? (<HomeSkeleton />) : (
		<VStack p={"20px"} w={width} bg={colors.darkGray} flex={1} alignItems={"center"}>
			<ScrollView w={"100%"} showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
				<VStack w={"100%"} justifyContent={"center"} alignItems={"center"} borderRadius={"10px"}>
					<VStack bg={colors.lightGray} p={"20px"} w={"100%"} justifyContent={"space-between"} borderRadius={"10px"} h={scale(160)}>
						<VStack>
							<Heading size={"lg"} color={"white"}>Balance</Heading>
							<Heading fontSize={scale(28)} color={"white"}>{FORMAT_CURRENCY(account?.balance || 0)}</Heading>
						</VStack>
						<HStack w={"100%"} alignItems={"center"} justifyContent={"space-between"} >
							<Button
								opacity={account?.allowSend ? 1 : 0.6}
								w={"49%"}
								bg={"darkGray"}
								mt={"20px"}
								borderRadius={"10px"}
								title="Enviar"
								onPress={() => account?.allowSend ? router.navigate("/user") : handleAlert()}
								leftRender={<Image resizeMode='contain' tintColor={colors.white} alt='send-image-icon' w={"25px"} h={"25px"} source={sendIcon} />}
							/>
							<Button
								leftRender={<Image resizeMode='contain' tintColor={colors.white} alt='send-image-icon' w={"25px"} h={"25px"} source={bagIcon} />}
								w={"49%"}
								bg={"darkGray"}
								mt={"20px"}
								borderRadius={"10px"}
								title="Solicitar" onPress={() => router.navigate("/request")}
							/>
						</HStack>
					</VStack>
				</VStack>
				<VStack w={"100%"} pt={"20px"}>
					<Heading fontSize={scale(18)} color={"white"}>Servicios</Heading>
					<HStack mt={"10px"} mb={"30px"} justifyContent={"space-between"}>
						{services.map((item, index) => (
							<VStack key={`service-${item.name}-${index}`} alignItems={"center"}>
								<Pressable onPress={item.onPress} _pressed={{ opacity: 0.5 }} borderRadius={"15px"} bg={colors.lightGray} w={width * 0.2} h={width * 0.2} justifyContent={"center"} alignItems={"center"}>
									<Image resizeMode='contain' alt='send-image-icon' w={scale(40)} h={scale(40)} source={item.image} />
								</Pressable>
								<Text fontWeight={"bold"} color={"white"}>{item.name}</Text>
							</VStack>
						))}
					</HStack>
					<RecentTransactions />
				</VStack>
				<VStack w={"100%"} my={"40px"} alignItems={"center"}>
					<HStack bg={colors.lightGray} w={"40px"} h={"40px"} borderRadius={100} justifyContent={"center"} alignItems={"center"}>
						<MaterialIcons name="security" size={24} color={colors.mainGreen} />
					</HStack>
					<Text mt={"10px"} w={"80%"} fontSize={scale(12)} textAlign={"center"} color={"white"}>
						Binomia es una plataforma de servicios financieros. todos los servicios son realizados en línea.
						Para más información, visita nuestra página de privacidad y términos.
					</Text>
					<Text mt={"30px"} w={"80%"} fontSize={scale(12)} textAlign={"center"} color={"white"}>
						© 2025 Binomia. Todos los derechos reservados.
					</Text>
				</VStack>
			</ScrollView>
			<QRScannerScreen defaultPage={1} open={showBottomSheet} onCloseFinish={() => setShowBottomSheet(false)} />
		</VStack>
	))
}


export default HomeScreen
