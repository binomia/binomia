import { SafeAreaView, Dimensions } from 'react-native'
import React from 'react'
import { Heading, Image, Text, VStack } from 'native-base'
import { welcome } from '@/assets'
import colors from '@/colors'
import { useNavigation } from '@react-navigation/native'
import Button from '@/components/global/Button'

const { height } = Dimensions.get('window')
const WelcomeScreen: React.FC = () => {
	const navigation = useNavigation<any>()

	return (
		<SafeAreaView style={{ flex: 1, backgroundColor: colors.darkGray }}>
			<VStack variant={"body"} justifyContent={"space-between"} h={"100%"}>
				<VStack h={"65%"} w={"100%"} justifyContent={"flex-end"} alignItems={"center"}>
					<Image alt='welcome-logo-image' resizeMode='contain' w={"100%"} h={height / 3} source={welcome} />
					<Heading size={"2xl"} color={"white"}>Hola, Bienvenido</Heading>
					<Text textAlign={"center"} w={"75%"} color={"white"}>Tu dinero, siempre a tu alcance. Seguro y rápido. Todo en un solo lugar.</Text>
				</VStack>
				<VStack w={"100%"} px={"20px"} alignItems={"center"}>
					<Button w={"100%"} bg={"mainGreen"} mb="20px" title="Crear una Cuenta" onPress={() => navigation.navigate("RegisterScreen")} />
				</VStack>
			</VStack>
		</SafeAreaView>
	)
}

export default WelcomeScreen

