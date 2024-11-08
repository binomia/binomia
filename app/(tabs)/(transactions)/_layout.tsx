import React from 'react';
import colors from '@/colors';
import { Stack } from 'expo-router';
import { TransactionsHeaderRight } from '@/components/navigation/HeaderBar';

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
			<Stack.Screen name='transactions' options={{ ...defaultscreenOptions, title: "Transacciones", headerRight: () => <TransactionsHeaderRight /> }} />
		</Stack>
	);
}
