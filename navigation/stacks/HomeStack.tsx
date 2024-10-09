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


const { width, height } = Dimensions.get('window')
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


    const headerStyles = {
        headerTitleStyle: { color: colors.white },
        headerShadowVisible: false,
        headerStyle: {
            backgroundColor: colors.primaryBlack,
        }
    }


    return (
        <Stack.Navigator  initialRouteName='HomeScreen' screenOptions={{ headerTintColor: colors.white, headerStyle: {} }} >
            <Stack.Screen name='HomeScreen' options={{ headerLeft, headerRight, title: '', ...headerStyles }} component={HomeScreen} />
            <Stack.Screen name='SearchUserScreen' options={{ headerRight, headerBackTitle: '', title: 'Buscar', ...headerStyles }} component={SearchUserScreen} />
        </Stack.Navigator >
    )
}


export default HomeStack

