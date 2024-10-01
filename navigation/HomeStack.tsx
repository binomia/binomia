import { createNativeStackNavigator } from '@react-navigation/native-stack';
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


const { width, height } = Dimensions.get('window')
const HomeStack: React.FC = () => {
    const navigation = useNavigation<any>();
    const Stack = createNativeStackNavigator<any>();
    const { resetAllStates, showCloseButton } = useContext<GlobalContextType>(GlobalContext);


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
        headerBackTitle: '',
        headerTitleStyle: { color: colors.white },
        headerStyle: {
            backgroundColor: colors.primaryBlack,
            headerShadowVisible: false
        }
    }


    return (
        <Stack.Navigator initialRouteName='HomeScreen' >
            <Stack.Screen name='WelcomeScreen' options={{ headerLeft, headerRight, title: '', ...headerStyles, headerShadowVisible: false }} component={HomeScreen} />
        </Stack.Navigator >
    )
}


export default HomeStack

