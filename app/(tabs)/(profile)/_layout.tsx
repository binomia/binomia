import React from 'react';
import colors from '@/colors';
import { Stack } from 'expo-router';
import { HomeHeaderRight } from '@/components/navigation/HeaderBar';

export default () => {
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
			<Stack.Screen name='profile' options={{ ...defaultscreenOptions, title: "" }} />
			<Stack.Screen name='personal' options={{ ...defaultscreenOptions, title: "Información Personal", headerRight: () => <HomeHeaderRight /> }} />
			<Stack.Screen name='privacy' options={{ ...defaultscreenOptions, title: "Privacidad & Seguridad", headerRight: () => <HomeHeaderRight /> }} />
			<Stack.Screen name='limits' options={{ ...defaultscreenOptions, title: "Limites De Cuenta", headerRight: () => <HomeHeaderRight /> }} />
			<Stack.Screen name='notifications' options={{ ...defaultscreenOptions, title: "Notificaciones", headerRight: () => <HomeHeaderRight /> }} />
			<Stack.Screen name='support' options={{ ...defaultscreenOptions, title: "Soporte", headerRight: () => <HomeHeaderRight /> }} />
		</Stack>
	);
}
