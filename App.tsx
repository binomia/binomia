import { LogBox, StyleSheet, StatusBar, View, Text, ActivityIndicator } from 'react-native';
import { useCallback, useEffect } from 'react';
import { SessionContextProvider } from '@/contexts/sessionContext';
import { ApolloProvider } from '@apollo/client';
import { NativeBaseProvider } from "native-base";
import { theme } from '@/themes';
import { apolloClient } from '@/apollo';
import * as SplashScreen from 'expo-splash-screen';
import { Navigation } from '@/navigation';
import { NavigationContainer } from '@react-navigation/native';
import { GlobalContextProvider } from './contexts/globalContext';
import { useCameraPermission, useMicrophonePermission } from 'react-native-vision-camera';
import { Provider } from 'react-redux';
import { store } from '@/redux';

import { drizzle } from "drizzle-orm/expo-sqlite";
import { openDatabaseSync, SQLiteProvider } from "expo-sqlite/next";
import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator';
import migrations from './drizzle/migrations';
import { DATABASE_NAME } from '@/constants';


const expo = openDatabaseSync(DATABASE_NAME);
const db = drizzle(expo);


LogBox.ignoreAllLogs();
// SplashScreen.preventAutoHideAsync();

const App: React.FC = () => {
	const { success, error } = useMigrations(db, migrations);

	const cameraPermission = useCameraPermission()
	const microphonePermission = useMicrophonePermission()

	const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
	const onLayoutRootView = useCallback(async () => {
		try {
			if (!cameraPermission.hasPermission) {
				await cameraPermission.requestPermission();
			};

			if (!microphonePermission.hasPermission) {
				await microphonePermission.requestPermission();
			};

			await delay(4000); // Wait for 5 seconds
			await SplashScreen.hideAsync();

		} catch (error) {
			console.error({ error });
		}

	}, []);

	useEffect(() => {
		console.log("sqlite", error);

	}, [])

	return (
		<SQLiteProvider databaseName={DATABASE_NAME}>
			<Provider store={store}>
				<ApolloProvider client={apolloClient}>
					<NativeBaseProvider theme={theme}>
						<SessionContextProvider>
							<GlobalContextProvider>
								<View onLayout={onLayoutRootView} style={styles.container}>
									<StatusBar barStyle="light-content" />
									<NavigationContainer>
										<Navigation />
									</NavigationContainer>
								</View>
							</GlobalContextProvider>
						</SessionContextProvider>
					</NativeBaseProvider>
				</ApolloProvider>
			</Provider>
		</SQLiteProvider>
	);
}


const styles = StyleSheet.create({
	container: {
		backgroundColor: "pink",
		flex: 1
	}
});

export default App