import { Tabs } from 'expo-router';
import { Image } from 'native-base';
import React, { useEffect, useState } from 'react';
import colors from '@/colors';
import { bankIcon, bankOff, cardHolder, creditCard, homeOff, homeOn, profileOff, profileOn, transationsOff, transationsOn } from '@/assets';
import { HomeHeaderRight } from '@/components/navigation/HeaderBar';
import { globalActions } from '@/redux/slices/globalSlice';
import * as Crypto from 'expo-crypto';
import * as Network from 'expo-network';
import { useDispatch } from 'react-redux';
import useAsyncStorage from '@/hooks/useAsyncStorage';
import { useLocation } from '@/hooks/useLocation';


export default () => {
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
					title: '',
					tabBarIcon: ({ color, focused }) => (
						<Image resizeMode='contain' tintColor={focused ? colors.mainGreen : colors.pureGray} w={'25px'} h={'25px'} source={focused ? homeOn : homeOff} alt='home-on' />
					),
				}}
			/>
			<Tabs.Screen
				name="(transactions)"
				options={{
					...defaultHeaderOptions,
					headerRight: () => <HomeHeaderRight p='15px' />,
					title: '',
					tabBarIcon: ({ color, focused }) => (
						<Image resizeMode='contain' tintColor={focused ? colors.mainGreen : colors.pureGray} w={'25px'} h={'25px'} source={focused ? transationsOn : transationsOff} alt='home-on' />
					),
				}}
			/>
			<Tabs.Screen
				name="(banking)"
				options={{
					...defaultHeaderOptions,
					headerRight: () => <HomeHeaderRight p='15px' />,
					title: '',
					tabBarIcon: ({ color, focused }) => (
						<Image tintColor={focused ? colors.mainGreen : colors.pureGray} w={'28px'} h={'28px'} source={focused ? bankIcon : bankOff} alt='home-on' />
					),
				}}
			/>
			<Tabs.Screen
				name="(profile)"
				options={{
					title: '',
					tabBarIcon: ({ color, focused }) => (
						<Image resizeMode='contain' tintColor={focused ? colors.mainGreen : colors.pureGray} w={'25px'} h={'25px'} source={focused ? profileOn : profileOff} alt='home-on' />
					),
				}}
			/>

		</Tabs>
	);
}
