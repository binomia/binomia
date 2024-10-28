import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { VStack, Image } from 'native-base';
import colors from '@/colors';
import { qrIcon } from '@/assets';
import { TouchableOpacity, Dimensions } from 'react-native';
import { useState } from 'react';
import QRScannerScreen from '@/screens/QRScannerScreen';
import TransactionsScreen from '@/screens/TransactionsScreen';
import SingleTransactionScreen from '@/screens/SingleTransactionScreen';


const { width, height } = Dimensions.get('window')
const TransactionsStack: React.FC = () => {
    const Stack = createNativeStackNavigator<any>();

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
        headerShadowVisible: false,
        headerStyle: {
            backgroundColor: colors.primaryBlack,
        }
    }


    return (
        <Stack.Navigator initialRouteName='TransactionsScreen' screenOptions={{ headerTintColor: colors.white }} >
            <Stack.Screen name='TransactionsScreen' options={{ headerBackTitle: 'atras', title: 'Transacciones', ...headerStyles }} component={TransactionsScreen} />
            <Stack.Screen name='SingleTransactionScreen' options={{ headerRight, headerBackTitle: 'atras', title: 'Transaccione', ...headerStyles }} component={SingleTransactionScreen} />
        </Stack.Navigator >
    )
}


export default TransactionsStack

