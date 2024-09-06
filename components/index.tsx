import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Button } from 'react-native';
import { useCallback, useContext, useEffect, useState } from 'react';
import * as Application from 'expo-application';
import { SessionContext } from '@/contexts';
import * as SplashScreen from 'expo-splash-screen';


export default function Home() {
	const { onLogin, jwt, onLogout }: any = useContext(SessionContext);
	const [appIsReady, setAppIsReady] = useState(false);

	const wait = async (timeout: number) => {
		return new Promise(resolve => {
			setTimeout(resolve, timeout);
		});
	}

	useEffect(() => {
		(async () => {
			const status = await Application.getIosIdForVendorAsync();
			console.log({ status, jwt });
		})()
	}, [])

	useEffect(() => {
		async function prepare() {
			await wait(5000)
			
			setAppIsReady(true);
		}

		prepare();
	}, []);

	const onLayoutRootView = useCallback(async () => {
		if (appIsReady) {
			// This tells the splash screen to hide immediately! If we call this after
			// `setAppIsReady`, then we may see a blank screen while the app is
			// loading its initial state and rendering its first pixels. So instead,
			// we hide the splash screen once we know the root view has already
			// performed layout.
			await SplashScreen.hideAsync();
		}
	}, [appIsReady]);

	return (

		<View onLayout={onLayoutRootView} style={styles.container}>
			<Button title="Login" onPress={onLogin} />
		</View>

	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#fff',
		alignItems: 'center',
		justifyContent: 'center',
	},
});
