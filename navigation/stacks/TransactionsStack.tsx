import { createNativeStackNavigator, NativeStackNavigationOptions } from '@react-navigation/native-stack';
import { VStack, Image, Text } from 'native-base';
import colors from '@/colors';
import { logo, qrIcon } from '@/assets';
import Ionicons from '@expo/vector-icons/Ionicons';
import { TouchableOpacity, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useContext, useState } from 'react';
import { GlobalContextType } from '@/types';
import { GlobalContext } from '@/contexts/globalContext';
import HomeScreen from '@/screens/HomeScreen';
import QRScannerScreen from '@/screens/QRScannerScreen';
import SearchUserScreen from '@/screens/SearchUserScreen';
import TransactionsScreen from '@/screens/TransactionsScreen';
import SingleTransactionScreen from '@/screens/SingleTransactionScreen';


const { width, height } = Dimensions.get('window')
const TransactionsStack: React.FC = () => {
    const Stack = createNativeStackNavigator<any>();


    const headerLeft = () => {
        return (
            <VStack >
                <Image alt='logo-image' w={"115px"} h={"30px"} source={logo} />
            </VStack>
        )
    }

    const headerRight = () => {
        const [showBottomSheet, setShowBottomSheet] = useState(false)

        return (
            <VStack>
                <TouchableOpacity onPress={() => setShowBottomSheet(true)}>
                    <Image alt='logo-image' w={"25px"} h={"25px"} source={qrIcon} />
                </TouchableOpacity>
                <QRScannerScreen open={showBottomSheet} onCloseFinish={() => setShowBottomSheet(false)} />
            </VStack>
        )
    }


    const headerStyles = {
        // headerTitleStyle: { color: colors.white },
        headerShadowVisible: false,
        headerStyle: {
            backgroundColor: colors.primaryBlack,
        }
    }


    return (
        <Stack.Navigator initialRouteName='TransactionsScreen' screenOptions={{ headerTintColor: colors.white }} >
            <Stack.Screen name='TransactionsScreen' options={{ headerRight, headerBackTitle: 'atras', title: 'Transacciones', ...headerStyles }} component={TransactionsScreen} />
            <Stack.Screen name='SingleTransactionScreen' options={{ headerRight, headerBackTitle: 'atras', title: 'Transaccione', ...headerStyles }} component={SingleTransactionScreen} />
        </Stack.Navigator >
    )
}


export default TransactionsStack

