import React from 'react';
import colors from '@/colors';
import { Stack } from 'expo-router';
import { HeaderBankingRight, HomeHeaderLeft, HomeHeaderRight } from '@/components/navigation/HeaderBar';
import { Pressable } from 'native-base';
import Ionicons from '@expo/vector-icons/Ionicons';


export default function TabLayout() {
	const defaultHeaderStyles = {
		backgroundColor: colors.darkGray,
		shadowOpacity: 0,
	}
	const defaultTabStyles = {
		backgroundColor: colors.darkGray,
		borderTopWidth: 0,
		elevation: 0,
	}

	const defaultscreenOptions = {
		headerBackTitleVisible: false,
		headerTintColor: colors.white,
		headerStyle: { ...defaultHeaderStyles },
		tabBarStyle: { ...defaultTabStyles }

	}

	return (
		<Stack screenOptions={{ headerShadowVisible: false }}>
			<Stack.Screen name='index' options={{ ...defaultscreenOptions,  title: "", headerLeft: () => <HomeHeaderLeft />, headerRight: () => <HomeHeaderRight /> }} />
			<Stack.Screen name='user' options={{ title: "Buscar", ...defaultscreenOptions, headerRight: () => <HomeHeaderRight /> }} />
			<Stack.Screen name='request' options={{ title: "Solicitar Dinero", ...defaultscreenOptions}} />
		</Stack>
	);
}
