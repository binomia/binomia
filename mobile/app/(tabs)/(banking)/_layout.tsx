import React from 'react';
import colors from '@/colors';
import { Stack } from 'expo-router';
import { BankingHeaderRight } from '@/components/navigation/HeaderBar';

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
			<Stack.Screen name='banking' options={{ ...defaultscreenOptions, title: "Deposito & Retiros", headerRight: () => <BankingHeaderRight /> }} />
		</Stack>
	);
}
