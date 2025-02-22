import { Dimensions } from 'react-native'
import React from 'react'
import { Heading, HStack, Text, Image, VStack } from 'native-base'
import { flagged } from '@/assets'
import Button from '@/components/global/Button'
import colors from '@/colors'
import { router } from 'expo-router'
import { MaterialIcons } from '@expo/vector-icons';


const { width, height } = Dimensions.get('window')
const FlaggedScreen: React.FC = () => {

	return (
		<VStack variant={"body"} justifyContent={'space-between'} alignItems={'center'} flex={1}>
			<VStack>
				<HStack w={width} h={height * 0.4} alignItems={'center'} justifyContent={'center'}>
					<Image resizeMode='contain' w={width / 1.9} h={width / 1.9} alt='logo-image' source={flagged} />
				</HStack>
				<Heading px={'20px'} textAlign={'center'} color={'white'}>Actividad Sospechosa</Heading>
				<Text px={'20px'} fontSize={'16px'} textAlign={'center'} color={'white'}>
					Tu cuenta esta siendo temporalmente revisada por actividad sospechosa. Si crees que es un error, por favor contactanos.
				</Text>
			</VStack>
			<Button
				title='Contactanos'
				w={"80%"}
				mb={"40px"}
				onPress={async () => await router.navigate("/support")}
				bg={colors.mainGreen}
				leftRender={<MaterialIcons name="phone" size={24} color="white" />}
			/>
		</VStack>
	)
}

export default FlaggedScreen
