import 'react-native-reanimated';
import { Stack } from 'expo-router';
import colors from '@/colors';


export default () => {

	const defaultHeaderStyles = {
		backgroundColor: colors.darkGray,
		shadowOpacity: 0,
		paddingLeft: 0
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
		<Stack screenOptions={{ ...defaultscreenOptions }}>
			<Stack.Screen name="deposit" options={{ headerShown: false }} />
			<Stack.Screen name='recurrences' options={{ headerShown: false }} />
			<Stack.Screen name='cards' options={{ headerShown: false }} />
		</Stack>
	);
}
