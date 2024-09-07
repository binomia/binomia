import { LogBox, StyleSheet, StatusBar } from 'react-native';
import { useCallback } from 'react';
import { SessionContextProvider } from '@/contexts';
import { ApolloProvider } from '@apollo/client';
import { NativeBaseProvider, View } from "native-base";
import { theme } from '@/themes';
import { apolloClient } from '@/apollo';
import * as SplashScreen from 'expo-splash-screen';
import { Navigation } from '@/navigation';
import { NavigationContainer } from '@react-navigation/native';


LogBox.ignoreAllLogs();
SplashScreen.preventAutoHideAsync();

export default function App() {

	const onLayoutRootView = useCallback(async () => {
		const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

		await delay(3000); // Wait for 5 seconds
		await SplashScreen.hideAsync();

	}, []);

	return (
		<ApolloProvider client={apolloClient}>
			<NativeBaseProvider theme={theme}>
				<SessionContextProvider>
					<View onLayout={onLayoutRootView} style={styles.container}>
						<StatusBar barStyle="light-content" />
						<NavigationContainer>
							<Navigation />
						</NavigationContainer>
					</View>
				</SessionContextProvider>
			</NativeBaseProvider>
		</ApolloProvider>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
});
