import { Tabs } from 'expo-router';
import { Image } from 'native-base';
import React from 'react';

import colors from '@/colors';
import { homeOff, homeOn } from '@/assets';
import { HomeHeaderLeft, HomeHeaderRight } from '@/components/navigation/HeaderBar';

export default function TabLayout() {
	const defaultHeaderStyles = {
		backgroundColor: colors.darkGray,
		shadowOpacity: 0
	}
	const defaultTabStyles = {
		backgroundColor: colors.darkGray,
		borderTopWidth: 0,
		elevation: 0,
	}

	const defaultscreenOptions = {
		headerStyle: { ...defaultHeaderStyles },
		tabBarStyle: { ...defaultTabStyles }
	}
	return (
		<Tabs
			screenOptions={{ ...defaultscreenOptions, headerLeft: () => <HomeHeaderLeft />, headerRight: () => <HomeHeaderRight /> }}>
			<Tabs.Screen
				name="index"
				options={{
					title: '',
					tabBarIcon: ({ color, focused }) => (
						<Image resizeMode='contain' tintColor={focused ? colors.mainGreen : colors.pureGray} w={'25px'} h={'25px'} source={focused ? homeOn : homeOff} alt='home-on' />
					),
				}}
			/>
			<Tabs.Screen
				name="transactions"
				options={{
					title: '',
					tabBarIcon: ({ color, focused }) => (
						<Image resizeMode='contain' tintColor={focused ? colors.mainGreen : colors.pureGray} w={'25px'} h={'25px'} source={focused ? homeOn : homeOff} alt='home-on' />
					),
				}}
			/>

		</Tabs>
	);
}
