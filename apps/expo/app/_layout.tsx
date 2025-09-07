import 'react-native-get-random-values';
import 'react-native-reanimated';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import React, { useCallback, useEffect, Suspense } from 'react';
import { NativeBaseProvider } from 'native-base';
import { theme } from '@/themes';
import { Provider } from 'react-redux';
import { store } from '@/redux';
import { ApolloProvider } from '@apollo/client';
import { apolloClient } from '@/apollo';
import { SessionContextProvider } from '@/contexts/sessionContext';
import { GlobalContextProvider } from '@/contexts/globalContext';
import { ActivityIndicator, LogBox, View } from 'react-native';
import { useCameraPermission, useMicrophonePermission } from 'react-native-vision-camera';
import { SocketContextProvider } from '@/contexts/socketContext';
import { TopUpContextProvider } from '@/contexts/topUpContext';
import { RouterContextProvider } from '@/contexts/RouterContext';
import * as Sentry from '@sentry/react-native';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const SpaceMono = require('../fonts/SpaceMono-Regular.ttf');

LogBox.ignoreAllLogs(true);
LogBox.ignoreLogs(['In React 18']);
SplashScreen.preventAutoHideAsync();


const Layout = () => {
	const cameraPermission = useCameraPermission()
	const microphonePermission = useMicrophonePermission()

	const [fontsLoaded] = useFonts({
		SpaceMono
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

			await delay(5000);
			await SplashScreen.hideAsync();

		} catch (error) {
			console.error({ error });
		}

	}, []);

	useEffect(() => {
		Sentry.init({
			dsn: "https://fbfc6726bd4ce4d8269b85359bf908fe@o4508923661058048.ingest.us.sentry.io/4508928816906240",
			debug: false
		});
	}, []);

	useEffect(() => {
		if (fontsLoaded) {
			SplashScreen.hideAsync();
		}
	}, [fontsLoaded])


	if (!fontsLoaded) {
		return null;
	}


	return (
		<Suspense fallback={<ActivityIndicator size={"large"} />}>
			<NativeBaseProvider theme={theme}>
				<Provider store={store}>
					<ApolloProvider client={apolloClient}>
						<SessionContextProvider>
							<GlobalContextProvider>
								<SocketContextProvider>
									<TopUpContextProvider>
										<View onLayout={onLayoutRootView} style={{ flex: 1 }}>
											<RouterContextProvider />
										</View>
									</TopUpContextProvider>
								</SocketContextProvider>
							</GlobalContextProvider>
						</SessionContextProvider>
					</ApolloProvider>
				</Provider >
			</NativeBaseProvider>
		</Suspense>
	);
}


export default Layout