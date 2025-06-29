import React from 'react';
import colors from '@/colors';
import { Stack } from 'expo-router';
import { HomeHeaderLeft, HomeHeaderRight, TopupsRight, TransactionsHeaderRight } from '@/components/navigation/HeaderBar';

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
		headerBackTitleVisible: false,
		headerTintColor: colors.white,
		headerStyle: { ...defaultHeaderStyles },
		tabBarStyle: { ...defaultTabStyles },

	}

	return (
		<Stack screenOptions={{ headerShadowVisible: false }}>
			<Stack.Screen name='index' options={{ ...defaultscreenOptions, title: "", headerLeft: () => <HomeHeaderLeft />, headerRight: () => <HomeHeaderRight /> }} />
			<Stack.Screen name='user' options={{ title: "Buscar", ...defaultscreenOptions, headerRight: () => <HomeHeaderRight /> }} />
			<Stack.Screen name='request' options={{ title: "Solicitar Dinero", ...defaultscreenOptions }} />
			<Stack.Screen name='insurances' options={{ title: "Seguros", ...defaultscreenOptions, headerRight: () => <TopupsRight /> }} />
			<Stack.Screen name='topups' options={{ title: "Recargas", ...defaultscreenOptions, headerRight: () => <TopupsRight /> }} />
			<Stack.Screen name='topUpTransactions' options={{ title: "", ...defaultscreenOptions, headerRight: () => <TopupsRight /> }} />
			<Stack.Screen name='createTopUp' options={{ title: "Nueva Recarga", ...defaultscreenOptions }} />
			<Stack.Screen name='transactions' options={{ ...defaultscreenOptions, title: "Transacciones", headerRight: () => <TransactionsHeaderRight /> }} />
		</Stack>
	);
}
