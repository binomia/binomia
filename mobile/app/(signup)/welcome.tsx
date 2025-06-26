import React from 'react'
import colors from '@/colors'
import Button from '@/components/global/Button'
import { SafeAreaView, Dimensions } from 'react-native'
import { Heading, Image, Text, VStack } from 'native-base'
import { welcome } from '@/assets'
import { router } from 'expo-router'

const { height } = Dimensions.get('window')
const WelcomeScreen: React.FC = () => {

	return (
		<SafeAreaView style={{ flex: 1, backgroundColor: colors.darkGray }}>
			<VStack variant={"body"} justifyContent={"space-between"} h={"100%"}>
				<VStack h={"65%"} w={"100%"} justifyContent={"flex-end"} alignItems={"center"}>
					<Image alt='welcome-logo-image' resizeMode='contain' w={"100%"} h={height / 3} source={welcome} />
					<Heading size={"2xl"} color={"white"}>Hola, Bienvenido</Heading>
					<Text textAlign={"center"} w={"75%"} color={"white"}>Tu dinero, siempre a tu alcance. Seguro y rápido. Todo en un solo lugar.</Text>
				</VStack>
				<VStack w={"100%"} px={"20px"} alignItems={"center"}>
					<Button w={"100%"} bg={"mainGreen"} mb="20px" title="Crear una Cuenta" onPress={() => router.navigate("register")} />
				</VStack>
			</VStack>
		</SafeAreaView>
	)
}

export default WelcomeScreen

