import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import * as Network from 'expo-network';
import { useEffect } from 'react';
import * as Device from 'expo-device';
import * as Application from 'expo-application';

export default function App() {

	useEffect(() => {
		(async () => {
			const status = await Application.getIosIdForVendorAsync();
			console.log({status});
		})()
	},[])

	return (
		<View style={styles.container}>
			<Text>Open up App.tsx to start working on your app!</Text>
			<StatusBar style="auto" />
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
