import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { VStack, Image } from 'native-base';
import colors from '@/colors';
import { creditCard, logo, qrIcon } from '@/assets';
import { TouchableOpacity } from 'react-native';
import { useState } from 'react';
import HomeScreen from '@/screens/HomeScreen';
import QRScannerScreen from '@/screens/QRScannerScreen';
import SearchUserScreen from '@/screens/SearchUserScreen';
import BankingScreen from '@/screens/BankingScreen';
import Cards from '@/components/cards';


const HomeStack: React.FC = () => {
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
    const headerBankingRight = () => {
        const [showAllCards, setShowAllCards] = useState<boolean>(false)

        return (
            <VStack>
                <TouchableOpacity onPress={() => setShowAllCards(true)}>
                    <Image alt='logo-image
                    ' w={"25px"} h={"25px"} source={creditCard} />
                </TouchableOpacity>
                <Cards onCloseFinish={() => setShowAllCards(false)} open={showAllCards} />

            </VStack>
        )
    }


    const headerStyles = {
        headerTitleStyle: { color: colors.white },
        headerShadowVisible: false,
        headerStyle: {
            backgroundColor: colors.primaryBlack,
        }
    }


    return (
        <Stack.Navigator initialRouteName='HomeScreen' screenOptions={{ headerTintColor: colors.white, headerStyle: {} }} >
            <Stack.Screen name='HomeScreen' options={{ headerLeft, headerRight, title: '', ...headerStyles }} component={HomeScreen} />
            <Stack.Screen name='SearchUserScreen' options={{ headerRight, headerBackTitle: '', title: 'Buscar', ...headerStyles }} component={SearchUserScreen} />
            <Stack.Screen name='BankingScreen' options={{ headerRight: headerBankingRight, headerBackTitle: '', title: 'Deposito & Retiros', ...headerStyles }} component={BankingScreen} />
        </Stack.Navigator >
    )
}


export default HomeStack

