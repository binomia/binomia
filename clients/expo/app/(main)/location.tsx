import { Dimensions } from 'react-native'
import React from 'react'
import { Heading, HStack, Text, Image, VStack } from 'native-base'
import { location } from '@/assets'
import Button from '@/components/global/Button'
import colors from '@/colors'
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context'
import * as Linking from 'expo-linking';


const { width, height } = Dimensions.get('window')
const FlaggedScreen: React.FC = () => {

	return (
		<SafeAreaView style={{ flex: 1, backgroundColor: colors.darkGray }}>
			<VStack variant={"body"} justifyContent={'space-between'} alignItems={'center'} flex={1}>
				<VStack>
					<HStack w={width} h={height * 0.4} alignItems={'center'} justifyContent={'center'}>
						<Image resizeMode='contain' w={width / 1.2} h={width / 1.2} alt='logo-image' source={location} />
					</HStack>
					<Heading px={'20px'} textAlign={'center'} textTransform={'capitalize'} color={'white'}>Ubicación Desactivada</Heading>
					<Text px={'20px'} fontSize={'16px'} textAlign={'center'} color={'white'}>
						Tu ubicación debe estar activada para realizar una transacción. Por favor, actívala e inténtalo de nuevo.
					</Text>
				</VStack>
				<Button
					title='Activar Ubicación'
					w={"80%"}
					mb={"40px"}
					onPress={async () => Linking.openSettings()}
					bg={colors.mainGreen}
					leftRender={<MaterialIcons name="edit-location-alt" size={24} color="white" />}
				/>
			</VStack>

		</SafeAreaView>
	)
}

export default FlaggedScreen
