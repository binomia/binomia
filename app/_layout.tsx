import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useCallback, useEffect } from 'react';
import 'react-native-reanimated';

import { NativeBaseProvider } from 'native-base';
import { theme } from '@/themes';
import { DATABASE_NAME } from '@/constants';
import { SQLiteProvider } from "expo-sqlite/next";
import { Provider } from 'react-redux';
import { store } from '@/redux';
import { ApolloProvider } from '@apollo/client';
import { apolloClient } from '@/apollo';
import { SessionContextProvider } from '@/contexts/sessionContext';
import { GlobalContextProvider } from '@/contexts/globalContext';
import { View } from 'react-native';
import { useCameraPermission, useMicrophonePermission } from 'react-native-vision-camera';


// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
	const cameraPermission = useCameraPermission()
	const microphonePermission = useMicrophonePermission()
	const [loaded] = useFonts({
		SpaceMono: require('../fonts/SpaceMono-Regular.ttf'),
	});


	const onLayoutRootView = useCallback(async () => {
		try {
			const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
			if (!cameraPermission.hasPermission) {
				await cameraPermission.requestPermission();
			};

			if (!microphonePermission.hasPermission) {
				await microphonePermission.requestPermission();
			};

			await delay(5000); // Wait for 5 seconds
			await SplashScreen.hideAsync();

		} catch (error) {
			console.error({ error });
		}

	}, []);

	useEffect(() => {
		if (loaded) {
			SplashScreen.hideAsync();
		}
	}, [loaded]);

	if (!loaded) {
		return null;
	}

	return (
		<SQLiteProvider databaseName={DATABASE_NAME}>
			<Provider store={store}>
				<ApolloProvider client={apolloClient}>
					<NativeBaseProvider theme={theme}>
						<SessionContextProvider>
							<GlobalContextProvider>
								<View onLayout={onLayoutRootView} style={{ flex: 1 }}>
									<Stack>
										<Stack.Screen name="(tabs)" options={{ headerShown: false }} />
										<Stack.Screen name="(modals)" options={{ headerShown: false, presentation: "containedModal" }} />
										<Stack.Screen name="+not-found" />
									</Stack>
								</View>
							</GlobalContextProvider>
						</SessionContextProvider>
					</NativeBaseProvider>
				</ApolloProvider>
			</Provider >
		</SQLiteProvider>
	);
}
