import { Dimensions } from 'react-native'
import React from 'react'
import { Heading, HStack, Text, Image, VStack } from 'native-base'
import { errorIcon } from '@/assets'
import Button from '@/components/global/Button'
import colors from '@/colors'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router, useLocalSearchParams } from 'expo-router'


const { width, height } = Dimensions.get('window')
const FlaggedScreen: React.FC = () => {
	const { message, title } = useLocalSearchParams()



	return (
		<SafeAreaView style={{ flex: 1, backgroundColor: colors.darkGray }}>
			<VStack variant={"body"} justifyContent={'space-between'} alignItems={'center'} flex={1}>
				<VStack>
					<HStack w={width} h={height * 0.4} alignItems={'center'} justifyContent={'center'}>
						<Image resizeMode='contain' w={width / 1.2} h={width / 1.2} alt='logo-image' source={errorIcon} />
					</HStack>
					<Heading px={'20px'} textAlign={'center'} textTransform={'capitalize'} color={'white'}>{title}</Heading>
					<Text px={'20px'} fontSize={'16px'} textAlign={'center'} color={'white'}>{message}</Text>
				</VStack>
				<Button
					title='Volver Al Inicio'
					w={"80%"}
					mb={"40px"}
					onPress={async () => router.navigate("(home)")}
					bg={colors.mainGreen}
				/>
			</VStack>

		</SafeAreaView>
	)
}

export default FlaggedScreen
