import { SafeAreaView, Dimensions } from 'react-native'
import React from 'react'
import { Heading, Image, Text, VStack } from 'native-base'
import { welcome } from '@/assets'
import { Button } from '@/components'
import colors from '@/colors'

const { height } = Dimensions.get('window')
const WelcomeScreen: React.FC = () => {
	return (
		<SafeAreaView style={{ flex: 1, backgroundColor: colors.darkGray }}>
			<VStack variant={"body"} justifyContent={"space-between"} alignItems={"center"}>
				<VStack h={"65%"} w={"100%"} justifyContent={"flex-end"} alignItems={"center"}>
					<Image resizeMode='contain' w={"100%"} h={height / 3} source={welcome} />
					<Heading size={"2xl"} color={"white"}>Hola, Bienvenido</Heading>
					<Text textAlign={"center"} w={"80%"} color={"white"}>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</Text>
				</VStack>
				<Button style={{ mb: "20px" }} title="Crear una Cuenta" onPress={() => { }} />
			</VStack>
		</SafeAreaView>
	)
}

export default WelcomeScreen

