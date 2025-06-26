import React from 'react';
import { Tabs } from 'expo-router';
import { Image } from 'native-base';
import colors from '@/colors';
import { bankIcon, bankOff, homeOff, homeOn, profileOff, profileOn } from '@/assets';
import { HomeHeaderRight } from '@/components/navigation/HeaderBar';



const Layout = () => {
	const defaultTabStyles = {
		tabBarStyle: {
			backgroundColor: colors.darkGray,
			borderTopWidth: 0,
			elevation: 0,
		}
	}

	const defaultHeaderOptions = {
		headerTintColor: colors.white,
		headerStyle: {

			backgroundColor: colors.darkGray,
			shadowOpacity: 0,
		}
	}


	return (
		<Tabs screenOptions={{ headerShown: false, ...defaultTabStyles }}>
			<Tabs.Screen
				name="(home)"
				options={{
					freezeOnBlur: true,
					title: '',
					tabBarIcon: ({ focused }) => (
						<Image resizeMode='contain' tintColor={focused ? colors.mainGreen : colors.pureGray} w={'25px'} h={'25px'} source={focused ? homeOn : homeOff} alt='home-on' />
					),
				}}
			/>
			<Tabs.Screen
				name="(banking)"
				options={{
					...defaultHeaderOptions,
					headerRight: () => <HomeHeaderRight />,
					title: '',
					tabBarIcon: ({ focused }) => (
						<Image tintColor={focused ? colors.mainGreen : colors.pureGray} w={'28px'} h={'28px'} source={focused ? bankIcon : bankOff} alt='home-on' />
					),
				}}
			/>
			<Tabs.Screen
				name="(profile)"
				options={{
					title: '',
					tabBarIcon: ({ focused }) => (
						<Image resizeMode='contain' tintColor={focused ? colors.mainGreen : colors.pureGray} w={'25px'} h={'25px'} source={focused ? profileOn : profileOff} alt='home-on' />
					),
				}}
			/>

		</Tabs>
	);
}

export default Layout
